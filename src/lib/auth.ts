import crypto from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { getUserByHandle } from './db';

const SESSION_COOKIE = 'sillytavern_session';

export function hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
}

export function createSessionToken(handle: string): string {
    const payload = JSON.stringify({ handle, exp: Date.now() + 86400000 });
    const encoded = Buffer.from(payload).toString('base64');
    const sig = crypto.createHmac('sha256', encoded).digest('hex');
    return `${encoded}.${sig}`;
}

export function parseSessionToken(token: string): { handle: string } | null {
    try {
        const [encoded, sig] = token.split('.');
        const expectedSig = crypto.createHmac('sha256', encoded!).digest('hex');
        if (sig !== expectedSig) return null;
        const payload = JSON.parse(Buffer.from(encoded!, 'base64').toString('utf-8'));
        if (payload.exp && payload.exp < Date.now()) return null;
        return { handle: payload.handle };
    } catch {
        return null;
    }
}

export function setSessionCookie(event: RequestEvent, handle: string): void {
    const token = createSessionToken(handle);
    event.cookies.set(SESSION_COOKIE, token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 86400,
    });
}

export function clearSessionCookie(event: RequestEvent): void {
    event.cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function getAuthUser(event: RequestEvent): Promise<{ handle: string; admin: boolean } | null> {
    const token = event.cookies.get(SESSION_COOKIE);
    if (!token) return null;

    const parsed = parseSessionToken(token);
    if (!parsed) return null;

    const adminUser = process.env.ADMIN_USERNAME;
    if (parsed.handle === adminUser) {
        return { handle: adminUser, admin: true };
    }

    const user = await getUserByHandle(parsed.handle);
    if (!user || !user.enabled) return null;

    return { handle: user.handle, admin: !!user.admin };
}

export function requireAuth(event: RequestEvent): { handle: string; admin: boolean } {
    const user = event.locals.user;
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}

export function jsonError(status: number, message: string): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export function jsonOk(data: unknown): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
