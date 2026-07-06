import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const backgrounds = await sql('SELECT * FROM backgrounds WHERE user_handle = $1 ORDER BY created DESC', [
        event.locals.user.handle,
    ]);

    return jsonOk(backgrounds);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const backgrounds = await sql('SELECT * FROM backgrounds WHERE user_handle = $1 ORDER BY created DESC', [
        event.locals.user.handle,
    ]);
    return jsonOk(backgrounds);
};
