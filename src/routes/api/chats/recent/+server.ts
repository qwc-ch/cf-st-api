import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

const handle = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const chats = await sql(
        `
        SELECT c.id, c.name, c.character_id, c.updated,
               ch.name as character_name, ch.avatar_url
        FROM chats c
        LEFT JOIN characters ch ON ch.id = c.character_id
        WHERE c.user_handle = $1
        ORDER BY c.updated DESC LIMIT 50
    `,
        [event.locals.user.handle],
    );

    return jsonOk(chats);
};

export const GET = handle;
export const POST = handle;
