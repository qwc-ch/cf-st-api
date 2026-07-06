import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, name } = await event.request.json().catch(() => ({}));
    if (!id || !name) return jsonError(400, 'id and name are required');

    const now = Date.now();
    await sql('UPDATE chats SET name = $1, updated = $2 WHERE id = $3 AND user_handle = $4', [
        name,
        now,
        id,
        event.locals.user.handle,
    ]);
    return jsonOk({ ok: true });
};
