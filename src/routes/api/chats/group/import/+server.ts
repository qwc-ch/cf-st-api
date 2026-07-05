import { jsonError, jsonOk } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { id, data: chatData } = body;
    if (!id) return jsonError(400, 'id is required');

    const db = getDb(event.platform!);
    const group = await db
        .prepare('SELECT * FROM chat_groups WHERE user_handle = ? AND (name = ? OR id = ?)')
        .bind(event.locals.user.handle, id, parseInt(id, 10) || 0)
        .first<any>();

    if (!group) return jsonError(404, 'Group not found');

    let existingData = {};
    try {
        existingData = JSON.parse(group.data || '{}');
    } catch {}

    existingData = { ...existingData, chat: chatData || {} };

    await db
        .prepare('UPDATE chat_groups SET data = ?, updated = ? WHERE id = ? AND user_handle = ?')
        .bind(JSON.stringify(existingData), Date.now(), group.id, event.locals.user.handle)
        .run();

    return jsonOk({ ok: true });
};
