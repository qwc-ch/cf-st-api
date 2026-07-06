import { jsonError, jsonOk } from '../../../../lib/auth';

const handle = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const chats = await db
        .prepare(`
        SELECT c.id, c.name, c.character_id, c.updated,
               ch.name as character_name, ch.avatar_url
        FROM chats c
        LEFT JOIN characters ch ON ch.id = c.character_id
        WHERE c.user_handle = ?
        ORDER BY c.updated DESC LIMIT 50
    `)
        .bind(event.locals.user.handle)
        .all()
        .then((r) => r.results);

    return jsonOk(chats);
};

export const GET = handle;
export const POST = handle;
