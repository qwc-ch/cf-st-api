import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type { RequestEvent } from '@sveltejs/kit';
import { requireAuth, jsonError, jsonOk } from './auth';

const exec = promisify(execFile);

const DEFAULT_DIR = './static/scripts/extensions';

function getBaseDir(): string {
    return process.env.EXTENSIONS_DIR || DEFAULT_DIR;
}

async function ensureDir(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
}

export function getExtensionPath(_handle: string, name: string, _global: boolean): string {
    // All extensions go under third-party/ so they're served at /scripts/extensions/third-party/{name}/
    return path.join(getBaseDir(), 'third-party', name);
}

export interface ExtensionInfo {
    name: string;
    type: 'global' | 'local';
}

export async function discoverExtensions(_handle: string): Promise<ExtensionInfo[]> {
    const results: ExtensionInfo[] = [];
    const dir = path.join(getBaseDir(), 'third-party');
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                results.push({ name: `third-party/${entry.name}`, type: 'local' });
            }
        }
    } catch { /* directory doesn't exist yet */ }
    return results;
}

interface GitResult {
    stdout: string;
    stderr: string;
}

async function git(args: string[], cwd: string): Promise<GitResult> {
    try {
        const { stdout, stderr } = await exec('git', args, { cwd, timeout: 60000 });
        return { stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (err: any) {
        throw new Error(`Git error: ${err.stderr || err.message}`);
    }
}

export async function gitClone(url: string, dest: string, branch?: string): Promise<void> {
    await ensureDir(path.dirname(dest));
    const args = ['clone', '--depth=1'];
    if (branch) {
        args.push('--branch', branch);
    }
    args.push(url, dest);
    await git(args, path.dirname(dest));
}

export async function gitPull(cwd: string): Promise<{ branch: string; isUpToDate: boolean }> {
    // Save current branch
    const { stdout: branch } = await git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
    // Stash any local changes
    await git(['stash'], cwd).catch(() => {});
    // Pull
    const { stdout } = await git(['pull', '--ff-only'], cwd);
    const isUpToDate = stdout.includes('Already up to date');
    return { branch, isUpToDate };
}

export async function gitCheckout(cwd: string, branch: string): Promise<void> {
    await git(['checkout', branch], cwd);
}

export async function gitBranches(cwd: string): Promise<{ name: string; commit: string; current: boolean; label: string }[]> {
    const { stdout } = await git(['branch', '-a'], cwd);
    const lines = stdout.split('\n').filter(Boolean);
    const currentBranch = lines.find(l => l.startsWith('* '))?.replace('* ', '').trim() || '';
    const branches: { name: string; commit: string; current: boolean; label: string }[] = [];

    for (const line of lines) {
        const isCurrent = line.startsWith('* ');
        const name = line.replace('* ', '').trim();
        const remoteMatch = name.match(/^remotes\/origin\/(.+)$/);
        if (remoteMatch && branches.some(b => b.name === remoteMatch[1])) continue;
        const branchName = remoteMatch ? remoteMatch[1] : name;
        try {
            const { stdout: commit } = await git(['rev-parse', '--short', name], cwd);
            branches.push({
                name: branchName,
                commit,
                current: name === currentBranch,
                label: commit,
            });
        } catch { /* skip unparsable */ }
    }
    return branches;
}

export async function gitVersion(cwd: string): Promise<{
    currentBranchName: string;
    currentCommitHash: string;
    isUpToDate: boolean;
    remoteUrl: string;
}> {
    const { stdout: branch } = await git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
    const { stdout: hash } = await git(['rev-parse', 'HEAD'], cwd);
    const { stdout: remoteUrl } = await git(['remote', 'get-url', 'origin'], cwd);

    let isUpToDate = true;
    try {
        await git(['fetch', 'origin', branch], cwd);
        const { stdout: behind } = await git(['rev-list', '--count', `${branch}..origin/${branch}`], cwd);
        isUpToDate = behind === '0';
    } catch { /* cannot check, assume up to date */ }

    return {
        currentBranchName: branch,
        currentCommitHash: hash,
        isUpToDate,
        remoteUrl,
    };
}

export async function gitLsRemote(url: string): Promise<string[]> {
    const { stdout } = await git(['ls-remote', '--heads', url], '.');
    return stdout.split('\n').filter(Boolean).map(line => {
        const parts = line.split('\t');
        return parts[1]?.replace('refs/heads/', '') || '';
    }).filter(Boolean);
}

export async function removeDirectory(dir: string): Promise<void> {
    await fs.rm(dir, { recursive: true, force: true });
}

export async function moveDirectory(src: string, dest: string): Promise<void> {
    await ensureDir(path.dirname(dest));
    await fs.rename(src, dest);
}

function readBody(event: RequestEvent): Promise<Record<string, unknown>> {
    return event.request.json();
}

function requireUser(event: RequestEvent): { handle: string; admin: boolean } {
    const user = requireAuth(event);
    return user;
}

export async function handleInstall(event: RequestEvent): Promise<Response> {
    const user = requireUser(event);
    const body = await readBody(event);
    const url = body.url as string;
    const global = body.global as boolean || false;
    const branch = body.branch as string || '';

    if (!url || typeof url !== 'string') {
        return jsonError(400, 'Missing or invalid url');
    }

    // Extract folder name from URL (e.g., "SillyTavern-MyExtension" from "https://github.com/SillyTavern/SillyTavern-MyExtension")
    const urlObj = new URL(url);
    const folderName = path.basename(urlObj.pathname, '.git');
    if (!folderName) {
        return jsonError(400, 'Could not determine extension name from URL');
    }

    const dest = getExtensionPath(user.handle, folderName, global as boolean);

    // Check if already installed
    try {
        await fs.access(dest);
        return jsonError(409, `Extension '${folderName}' is already installed`);
    } catch { /* not installed, proceed */ }

    await ensureDir(path.dirname(dest));
    await gitClone(url, dest, branch);

    // Read manifest for display name
    let displayName = folderName;
    try {
        const manifestPath = path.join(dest, 'manifest.json');
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        if (manifest.display_name) {
            displayName = manifest.display_name;
        }
    } catch { /* no manifest, use folder name */ }

    return jsonOk({
        display_name: displayName,
        extensionPath: dest,
        folderName,
    });
}

export async function handleUpdate(event: RequestEvent): Promise<Response> {
    const user = requireUser(event);
    const body = await readBody(event);
    const extensionName = body.extensionName as string;
    const global = body.global as boolean || false;

    if (!extensionName) {
        return jsonError(400, 'Missing extensionName');
    }

    const extPath = getExtensionPath(user.handle, extensionName, global);

    try {
        await fs.access(extPath);
    } catch {
        return jsonError(404, `Extension '${extensionName}' not found`);
    }

    try {
        const { branch, isUpToDate } = await gitPull(extPath);
        const { stdout: shortCommitHash } = await exec('git', ['rev-parse', '--short', 'HEAD'], { cwd: extPath });
        return jsonOk({
            isUpToDate,
            shortCommitHash: shortCommitHash.stdout.trim(),
            branch,
        });
    } catch (err: any) {
        return jsonError(500, err.message);
    }
}

export async function handleDelete(event: RequestEvent): Promise<Response> {
    const user = requireUser(event);
    const body = await readBody(event);
    const extensionName = body.extensionName as string;
    const global = body.global as boolean || false;

    if (!extensionName) {
        return jsonError(400, 'Missing extensionName');
    }

    const extPath = getExtensionPath(user.handle, extensionName, global);

    try {
        await fs.access(extPath);
    } catch {
        return jsonError(404, `Extension '${extensionName}' not found`);
    }

    await removeDirectory(extPath);
    return jsonOk({ success: true });
}

export async function handleMove(event: RequestEvent): Promise<Response> {
    const user = requireUser(event);
    const body = await readBody(event);
    const extensionName = body.extensionName as string;
    const source = body.source as string;
    const destination = body.destination as string;

    if (!extensionName || !source || !destination) {
        return jsonError(400, 'Missing extensionName, source, or destination');
    }

    const isSourceGlobal = source === 'global';
    const isDestGlobal = destination === 'global';

    const srcPath = getExtensionPath(user.handle, extensionName, isSourceGlobal);
    const destPath = getExtensionPath(user.handle, extensionName, isDestGlobal);

    try {
        await fs.access(srcPath);
    } catch {
        return jsonError(404, `Extension '${extensionName}' not found in ${source}`);
    }

    try {
        await fs.access(destPath);
        return jsonError(409, `Extension '${extensionName}' already exists in ${destination}`);
    } catch { /* ok */ }

    await moveDirectory(srcPath, destPath);
    return jsonOk({ success: true });
}

export async function handleSwitch(event: RequestEvent): Promise<Response> {
    const user = requireUser(event);
    const body = await readBody(event);
    const extensionName = body.extensionName as string;
    const branch = body.branch as string;
    const global = body.global as boolean || false;

    if (!extensionName || !branch) {
        return jsonError(400, 'Missing extensionName or branch');
    }

    const extPath = getExtensionPath(user.handle, extensionName, global);

    try {
        await fs.access(extPath);
    } catch {
        return jsonError(404, `Extension '${extensionName}' not found`);
    }

    await gitCheckout(extPath, branch);
    return jsonOk({ success: true });
}

export async function handleVersion(event: RequestEvent): Promise<Response> {
    const user = requireUser(event);
    const body = await readBody(event);
    const extensionName = body.extensionName as string;
    const global = body.global as boolean || false;

    if (!extensionName) {
        return jsonError(400, 'Missing extensionName');
    }

    const extPath = getExtensionPath(user.handle, extensionName, global);

    try {
        await fs.access(extPath);
    } catch {
        return jsonError(404, `Extension '${extensionName}' not found`);
    }

    const info = await gitVersion(extPath);
    return jsonOk(info);
}

export async function handleBranches(event: RequestEvent): Promise<Response> {
    const user = requireUser(event);
    const body = await readBody(event);
    const extensionName = body.extensionName as string;
    const global = body.global as boolean || false;

    if (!extensionName) {
        return jsonError(400, 'Missing extensionName');
    }

    const extPath = getExtensionPath(user.handle, extensionName, global);

    try {
        await fs.access(extPath);
    } catch {
        return jsonError(404, `Extension '${extensionName}' not found`);
    }

    const branches = await gitBranches(extPath);
    return jsonOk(branches);
}

export async function handleExecute(event: RequestEvent): Promise<Response> {
    const user = requireUser(event);
    const body = await readBody(event);
    const extensionName = body.extensionName as string;
    const global = body.global as boolean || false;
    const method = body.method as string;
    const args = body.args as Record<string, unknown> || {};

    if (!extensionName) {
        return jsonError(400, 'Missing extensionName');
    }

    // Execute is for running extension scripts server-side
    // For security, we only support running node scripts in the extension directory
    const extPath = getExtensionPath(user.handle, extensionName, global);

    try {
        await fs.access(extPath);
    } catch {
        return jsonError(404, `Extension '${extensionName}' not found`);
    }

    // Check for server.js or server.ts entry point
    let serverScript: string | null = null;
    for (const f of ['server.js', 'server.ts', 'server.mjs']) {
        try {
            await fs.access(path.join(extPath, f));
            serverScript = f;
            break;
        } catch { /* not found */ }
    }

    if (!serverScript) {
        return jsonOk({ result: null, message: 'No server-side script found' });
    }

    const resolved = path.join(extPath, serverScript);
    try {
        const { stdout, stderr } = await exec('node', [resolved, JSON.stringify({ method, args })], {
            cwd: extPath,
            timeout: 30000,
        });
        return jsonOk({ result: stdout.trim(), stderr: stderr.trim() });
    } catch (err: any) {
        return jsonError(500, err.stderr || err.message);
    }
}
