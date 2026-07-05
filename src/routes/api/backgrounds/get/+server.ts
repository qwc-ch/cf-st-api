import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const db = getDb(event.platform!);
    const backgrounds = await db
        .prepare('SELECT * FROM backgrounds WHERE user_handle = ? ORDER BY created DESC')
        .bind(event.locals.user.handle)
        .all()
        .then((r) => r.results);

    return jsonOk(backgrounds);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const db = getDb(event.platform!);
    const backgrounds = await db
        .prepare('SELECT * FROM backgrounds WHERE user_handle = ? ORDER BY created DESC')
        .bind(event.locals.user.handle)
        .all()
        .then((r) => r.results);
    return jsonOk(backgrounds);
};
