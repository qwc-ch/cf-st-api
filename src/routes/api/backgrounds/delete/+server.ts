import { jsonError, jsonOk } from '../../../../lib/auth';
import { ensureUserExists, sql } from '../../../../lib/db';
export const POST = async (event) => {
    try {
        if (!event.locals.user) return jsonError(401, 'Unauthorized');
        const { name } = await event.request.json().catch(() => ({}));
        if (!name) return jsonError(400, 'name is required');

        await ensureUserExists(event.locals.user.handle);
        await sql('DELETE FROM backgrounds WHERE user_handle = $1 AND name = $2', [event.locals.user.handle, name]);
        return jsonOk({ ok: true });
    } catch (e) {
        console.error('Failed to delete background:', e);
        return jsonError(500, 'Failed to delete background');
    }
};
