import { jsonError } from '../../../../lib/auth';
import { ensureUserExists, sql } from '../../../../lib/db';

function jsonOk(data: Record<string, unknown>): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key } = body;

    if (!key) return jsonError(400, 'key is required');

    try {
        await ensureUserExists(event.locals.user.handle);

        const rows = await sql('SELECT value FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1', [
            event.locals.user.handle,
            key,
        ]);
        const found = (rows as { value: string }[])[0];

        return jsonOk({ value: found?.value || '' });
    } catch (err) {
        console.error('Failed to find secret:', err);
        return jsonError(500, 'Failed to find secret');
    }
};
