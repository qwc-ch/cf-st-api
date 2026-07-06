import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const tags = await sql('SELECT * FROM tags WHERE user_handle = $1 ORDER BY name', [event.locals.user.handle]);

    return jsonOk(tags);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const tags = await sql('SELECT * FROM tags WHERE user_handle = $1 ORDER BY name', [event.locals.user.handle]);
    return jsonOk(tags);
};
