import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { query, text, avatar_url, character_id, group_id } = await event.request.json().catch(() => ({}));
    const searchText = query || text;
    if (!searchText) return jsonError(400, 'query is required');

    let charId = character_id;
    if (!charId && avatar_url) {
        const char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
        if (char) charId = char.id;
    }

    let sqlQuery = `
        SELECT m.id, m.chat_id, m.role, m.name, m.content, m.message_id, c.name as chat_name
        FROM messages m
        JOIN chats c ON c.id = m.chat_id
        WHERE c.user_handle = $1 AND m.content LIKE $2`;
    const params: any[] = [event.locals.user.handle, `%${searchText}%`];

    if (charId) {
        sqlQuery += ' AND c.character_id = $3';
        params.push(charId);
    }

    sqlQuery += ' ORDER BY m.created DESC LIMIT 100';

    const results = await sql(sqlQuery, params);
    return jsonOk(results);
};
