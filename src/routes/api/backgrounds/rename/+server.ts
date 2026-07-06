import { jsonError, jsonOk } from '../../../../lib/auth';
import { ensureUserExists, sql } from '../../../../lib/db';
export const POST = async (event) => {
    try {
        if (!event.locals.user) return jsonError(401, 'Unauthorized');
        const body = await event.request.json().catch(() => ({}));
        const { id, name } = body;
        if (!id || !name) return jsonError(400, 'id and name are required');

        await ensureUserExists(event.locals.user.handle);
        const result = await sql('UPDATE backgrounds SET name = $1 WHERE id = $2 AND user_handle = $3', [
            name,
            id,
            event.locals.user.handle,
        ]);

        if (result.meta.changes === 0) return jsonError(404, 'Background not found');
        return jsonOk({ ok: true });
    } catch (e) {
        console.error('Failed to rename background:', e);
        return jsonError(500, 'Failed to rename background');
    }
};
