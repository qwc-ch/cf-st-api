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
    const { key, id } = body;

    if (!key || !id) return jsonError(400, 'key and id are required');

    try {
        await ensureUserExists(event.locals.user.handle);

        await sql('UPDATE secrets SET active = 0 WHERE user_handle = $1 AND key_name = $2', [
            event.locals.user.handle,
            key,
        ]);

        await sql('UPDATE secrets SET active = 1 WHERE id = $1 AND user_handle = $2', [id, event.locals.user.handle]);

        return jsonOk({ ok: true });
    } catch (err) {
        console.error('Failed to rotate secret:', err);
        return jsonError(500, 'Failed to rotate secret');
    }
};
