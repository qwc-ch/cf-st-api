import { jsonError, jsonOk } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { id } = body;
    if (!id) return jsonError(400, 'id is required');

    const db = getDb(event.platform!);
    const group = await db
        .prepare('SELECT * FROM chat_groups WHERE user_handle = ? AND (name = ? OR id = ?)')
        .bind(event.locals.user.handle, id, parseInt(id, 10) || 0)
        .first<any>();

    if (!group) return jsonError(404, 'Group not found');

    let members = [];
    try {
        members = JSON.parse(group.members || '[]');
    } catch {}
    let data = {};
    try {
        data = JSON.parse(group.data || '{}');
    } catch {}

    return jsonOk({
        id: group.id,
        name: group.name,
        members,
        data,
        created: group.created,
        updated: group.updated,
    });
};
