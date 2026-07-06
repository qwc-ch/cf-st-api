import { jsonError, jsonOk } from '../../../../lib/auth';
export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const tags = await db
        .prepare('SELECT * FROM tags WHERE user_handle = ? ORDER BY name')
        .bind(event.locals.user.handle)
        .all()
        .then((r) => r.results);

    return jsonOk(tags);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const tags = await db
        .prepare('SELECT * FROM tags WHERE user_handle = ? ORDER BY name')
        .bind(event.locals.user.handle)
        .all()
        .then((r) => r.results);
    return jsonOk(tags);
};
