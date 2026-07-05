import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id } = body;

    if (!key || !id) return jsonError(400, 'key and id are required');

    const db = getDb(event.platform!);

    await db
        .prepare('UPDATE secrets SET active = 0 WHERE user_handle = ? AND key_name = ?')
        .bind(event.locals.user.handle, key)
        .run();

    await db
        .prepare('UPDATE secrets SET active = 1 WHERE id = ? AND user_handle = ?')
        .bind(id, event.locals.user.handle)
        .run();

    return jsonOk({ ok: true });
};
