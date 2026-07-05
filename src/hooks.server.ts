import type { Handle } from '@sveltejs/kit';
import { getAuthUser } from './lib/auth';

const ALLOWED_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:8787',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:8787',
    'https://sillytavern.pages.dev',
    'https://*.sillytavern.pages.dev',
];

function matchesOrigin(origin: string, allowed: string): boolean {
    if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '(.+)');
        return new RegExp(`^${pattern}$`).test(origin);
    }
    return origin === allowed;
}

function getCorsOrigin(request: Request): string | null {
    const origin = request.headers.get('origin') || request.headers.get('Origin');
    if (!origin) return null;

    for (const allowed of ALLOWED_ORIGINS) {
        if (matchesOrigin(origin, allowed)) return origin;
    }

    // Allow any origin in development
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return origin;
    }

    return null;
}

function addCorsHeaders(response: Response, origin: string | null): Response {
    if (origin) {
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        headers.set('Access-Control-Allow-Credentials', 'true');
        headers.set('Access-Control-Max-Age', '86400');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    }
    return response;
}

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.user = await getAuthUser(event);

    // Handle CORS preflight
    if (event.request.method === 'OPTIONS') {
        const origin = getCorsOrigin(event.request);
        if (origin) {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }
        return new Response(null, { status: 204 });
    }

    const origin = getCorsOrigin(event.request);
    const response = await resolve(event);
    return addCorsHeaders(response, origin);
};
