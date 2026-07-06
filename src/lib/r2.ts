import fs from 'node:fs/promises';
import path from 'node:path';

const STORAGE_DIR = process.env.STORAGE_DIR || './data/storage';

// ── Storage backend selection ──
// Set STORAGE_BACKEND=s3 to use S3-compatible storage (R2, AWS S3, MinIO, etc.)
// Set STORAGE_BACKEND=local (default) to use local filesystem
const BACKEND = process.env.STORAGE_BACKEND || 'local';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];
const ALLOWED_MEDIA_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    'image/avif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/mp4',
];

export function isImageType(mime: string): boolean {
    return ALLOWED_IMAGE_TYPES.includes(mime);
}

export function isAllowedMediaType(mime: string): boolean {
    return ALLOWED_MEDIA_TYPES.includes(mime);
}

// ── Local filesystem backend ──

function localFilePath(key: string): string {
    return path.join(STORAGE_DIR, key);
}

async function localUpload(key: string, data: ArrayBuffer | Uint8Array | string): Promise<string> {
    const fp = localFilePath(key);
    await fs.mkdir(path.dirname(fp), { recursive: true });
    await fs.writeFile(fp, Buffer.from(data));
    return key;
}

async function localGet(key: string): Promise<Buffer | null> {
    try {
        return await fs.readFile(localFilePath(key));
    } catch {
        return null;
    }
}

async function localDelete(key: string): Promise<void> {
    try {
        await fs.unlink(localFilePath(key));
    } catch {
        // ignore
    }
}

async function localList(prefix: string): Promise<string[]> {
    const dir = path.join(STORAGE_DIR, prefix);
    try {
        const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
        return entries.filter((e) => e.isFile()).map((e) => path.join(prefix, e.name));
    } catch {
        return [];
    }
}

async function localListPrefix(
    prefix: string,
    delimiter?: string,
): Promise<{ objects: { key: string }[]; delimitedPrefixes: string[] }> {
    const dir = path.join(STORAGE_DIR, prefix);
    const delimitedPrefixes: string[] = [];
    const objects: { key: string }[] = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(prefix, entry.name);
            if (entry.isDirectory() && delimiter) {
                delimitedPrefixes.push(fullPath + '/');
            } else if (entry.isFile()) {
                objects.push({ key: fullPath });
            }
        }
    } catch {
        // directory doesn't exist
    }
    return { objects, delimitedPrefixes };
}

async function localMove(oldKey: string, newKey: string): Promise<void> {
    const newPath = localFilePath(newKey);
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.rename(localFilePath(oldKey), newPath);
}

async function localCopy(oldKey: string, newKey: string): Promise<void> {
    const newPath = localFilePath(newKey);
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.copyFile(localFilePath(oldKey), newPath);
}

async function localDeletePrefix(prefix: string): Promise<number> {
    const dir = path.join(STORAGE_DIR, prefix);
    let count = 0;
    try {
        const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile()) {
                await fs.unlink(path.join(entry.parentPath, entry.name));
                count++;
            }
        }
        await fs.rm(dir, { recursive: true, force: true });
    } catch {
        // ignore
    }
    return count;
}

// ── S3-compatible backend (uses @aws-sdk/client-s3) ──

let s3Client: any = null;
let s3Available = false;

async function initS3() {
    try {
        // Dynamic import to avoid build-time dependency
        const mod = await import(/* @vite-ignore */ '@aws-sdk/client-s3');
        const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = mod;
        s3Client = new S3Client({
            region: process.env.S3_REGION || 'auto',
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        });
        s3Available = true;
        return {
            S3Client,
            PutObjectCommand,
            GetObjectCommand,
            DeleteObjectCommand,
            ListObjectsV2Command,
            client: s3Client,
        };
    } catch {
        throw new Error('S3 storage requires @aws-sdk/client-s3 to be installed. Run: pnpm add @aws-sdk/client-s3');
    }
}

function getS3() {
    return initS3();
}

const S3_BUCKET = process.env.S3_BUCKET || '';

async function s3Upload(key: string, data: ArrayBuffer | Uint8Array | string, contentType?: string): Promise<string> {
    const { PutObjectCommand, client } = await getS3();
    const body = typeof data === 'string' ? data : new Uint8Array(data);
    await client.send(
        new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
        }),
    );
    return key;
}

async function s3Get(key: string): Promise<Buffer | null> {
    try {
        const { GetObjectCommand, client } = await getS3();
        const resp = await client.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
        const chunks: Uint8Array[] = [];
        for await (const chunk of resp.Body as any) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch {
        return null;
    }
}

async function s3Delete(key: string): Promise<void> {
    try {
        const { DeleteObjectCommand, client } = await getS3();
        await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    } catch {
        // ignore
    }
}

async function s3List(prefix: string): Promise<string[]> {
    const { ListObjectsV2Command, client } = await getS3();
    const result = await client.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }));
    return (result.Contents || []).map((o: any) => o.Key).filter(Boolean);
}

async function s3ListPrefix(
    prefix: string,
    delimiter?: string,
): Promise<{ objects: { key: string }[]; delimitedPrefixes: string[] }> {
    const { ListObjectsV2Command, client } = await getS3();
    const result = await client.send(
        new ListObjectsV2Command({
            Bucket: S3_BUCKET,
            Prefix: prefix,
            Delimiter: delimiter,
        }),
    );
    return {
        objects: (result.Contents || []).map((o: any) => ({ key: o.Key })),
        delimitedPrefixes: (result.CommonPrefixes || []).map((p: any) => p.Prefix),
    };
}

async function s3Copy(oldKey: string, newKey: string): Promise<void> {
    const { S3Client: _, PutObjectCommand, GetObjectCommand, client } = await getS3();
    const data = await s3Get(oldKey);
    if (data) {
        await client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: newKey, Body: data }));
    }
}

async function s3Move(oldKey: string, newKey: string): Promise<void> {
    await s3Copy(oldKey, newKey);
    await s3Delete(oldKey);
}

async function s3DeletePrefix(prefix: string): Promise<number> {
    const { DeleteObjectCommand, client } = await getS3();
    const keys = await s3List(prefix);
    for (const key of keys) {
        await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    }
    return keys.length;
}

// ── Backend dispatch ──

function useS3(): boolean {
    return BACKEND === 's3' && !!process.env.S3_ACCESS_KEY_ID && !!process.env.S3_BUCKET;
}

export async function uploadFile(
    key: string,
    data: ArrayBuffer | Uint8Array | string,
    contentType?: string,
): Promise<string> {
    if (useS3()) return s3Upload(key, data, contentType);
    return localUpload(key, data);
}

export async function uploadImage(
    userHandle: string,
    category: string,
    filename: string,
    data: ArrayBuffer,
    contentType: string,
): Promise<string> {
    const key = `${userHandle}/${category}/${filename}`;
    return uploadFile(key, data, contentType);
}

export async function getFile(
    key: string,
): Promise<{ body: ReadableStream | null; httpMetadata?: { contentType?: string } } | null> {
    if (useS3()) {
        const data = await s3Get(key);
        if (!data) return null;
        return {
            body: new ReadableStream({
                start(controller) {
                    controller.enqueue(data);
                    controller.close();
                },
            }),
        };
    }
    const data = await localGet(key);
    if (!data) return null;
    return {
        body: new ReadableStream({
            start(controller) {
                controller.enqueue(data);
                controller.close();
            },
        }),
    };
}

export async function getFileBuffer(key: string): Promise<Buffer | null> {
    if (useS3()) return s3Get(key);
    return localGet(key);
}

export async function deleteFile(key: string): Promise<void> {
    if (useS3()) return s3Delete(key);
    return localDelete(key);
}

export async function listFiles(prefix: string): Promise<string[]> {
    if (useS3()) return s3List(prefix);
    return localList(prefix);
}

export async function listPrefix(
    prefix: string,
    delimiter?: string,
): Promise<{ objects: { key: string }[]; delimitedPrefixes: string[] }> {
    if (useS3()) return s3ListPrefix(prefix, delimiter);
    return localListPrefix(prefix, delimiter);
}

export async function moveFile(oldKey: string, newKey: string): Promise<void> {
    if (useS3()) return s3Move(oldKey, newKey);
    return localMove(oldKey, newKey);
}

export async function copyFile(oldKey: string, newKey: string): Promise<void> {
    if (useS3()) return s3Copy(oldKey, newKey);
    return localCopy(oldKey, newKey);
}

export async function deletePrefix(prefix: string): Promise<number> {
    if (useS3()) return s3DeletePrefix(prefix);
    return localDeletePrefix(prefix);
}

export function getPublicUrl(key: string): string {
    const publicUrl = process.env.PUBLIC_STORAGE_URL;
    if (publicUrl) {
        return `${publicUrl}/${key}`;
    }
    return `/api/files/raw/${key}`;
}
