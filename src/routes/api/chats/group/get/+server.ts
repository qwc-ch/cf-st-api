import { jsonError, jsonOk } from '../../../../../lib/auth';
import { sql } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    const rows = await sql('SELECT * FROM chat_groups WHERE user_handle = $1 AND (name = $2 OR id = $3)', [
        event.locals.user.handle,
        id,
        parseInt(id, 10) || 0,
    ]);
    const group = (rows as any[])[0];
    if (!group) return jsonError(404, 'Group not found');

    let data = {};
    try {
        data = JSON.parse(group.data || '{}');
    } catch {}

    const chatData = (data as any).chat || {};
    const chatId = (data as any).chat_id || id;
    const messages = chatData.messages || [];
    const header = { chat_metadata: chatData.chat_metadata || {}, user_name: '', character_name: '' };

    return jsonOk([header, ...messages]);
};

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const id = event.url.searchParams.get('id');
    if (!id) return jsonError(400, 'id is required');

    const rows = await sql('SELECT * FROM chat_groups WHERE user_handle = $1 AND (name = $2 OR id = $3)', [
        event.locals.user.handle,
        id,
        parseInt(id, 10) || 0,
    ]);
    const group = (rows as any[])[0];
    if (!group) return jsonError(404, 'Group not found');

    let data = {};
    try {
        data = JSON.parse(group.data || '{}');
    } catch {}

    const chatData = (data as any).chat || {};
    const messages = chatData.messages || [];
    const header = { chat_metadata: chatData.chat_metadata || {}, user_name: '', character_name: '' };

    return jsonOk([header, ...messages]);
};
