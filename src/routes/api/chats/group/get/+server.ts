import { jsonError, jsonOk } from '../../../../../lib/auth';
import { sql } from '../../../../../lib/db';

async function handleGet(event) {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const id = event.url ? event.url.searchParams.get('id') : null;
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

    return jsonOk({
        id: group.name,
        data: data.chat || { messages: [] },
    });
}

export const POST = handleGet;
export const GET = handleGet;
