import { jsonError, jsonOk } from '../../../../../lib/auth';
import { sql } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { id } = body;
    if (!id) return jsonError(400, 'id is required');

    const rows = await sql('SELECT * FROM chat_groups WHERE user_handle = $1 AND (name = $2 OR id = $3)', [
        event.locals.user.handle,
        id,
        parseInt(id, 10) || 0,
    ]);
    const group = (rows as any[])[0];
    if (!group) return jsonError(404, 'Group not found');

    let existingData = {};
    try {
        existingData = JSON.parse(group.data || '{}');
    } catch {}
    delete existingData.chat;

    await sql('UPDATE chat_groups SET data = $1, updated = $2 WHERE id = $3 AND user_handle = $4', [
        JSON.stringify(existingData),
        Date.now(),
        group.id,
        event.locals.user.handle,
    ]);

    return jsonOk({ ok: true });
};
