import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, name } = await event.request.json().catch(() => ({}));
    if (!id || !name) return jsonError(400, 'id and name are required');

    const db = getDb(event.platform!);
    const now = Date.now();
    await db
        .prepare('UPDATE chats SET name = ?, updated = ? WHERE id = ? AND user_handle = ?')
        .bind(name, now, id, event.locals.user.handle)
        .run();
    return jsonOk({ ok: true });
};
