import { jsonError, jsonOk } from '../../../../lib/auth';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { text, character_id } = await event.request.json().catch(() => ({}));
    if (!text) return jsonError(400, 'text is required');

    let query = `
        SELECT m.id, m.chat_id, m.role, m.name, m.content, m.message_id, c.name as chat_name
        FROM messages m
        JOIN chats c ON c.id = m.chat_id
        WHERE c.user_handle = ? AND m.content LIKE ?`;
    const params: any[] = [event.locals.user.handle, `%${text}%`];

    if (character_id) {
        query += ' AND c.character_id = ?';
        params.push(character_id);
    }

    query += ' ORDER BY m.created DESC LIMIT 100';

    const results = await db
        .prepare(query)
        .bind(...params)
        .all()
        .then((r) => r.results);
    return jsonOk(results);
};
