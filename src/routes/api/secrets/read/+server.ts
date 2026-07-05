import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id } = body;

    if (!key) return jsonError(400, 'key is required');

    const db = getDb(event.platform!);
    let found;

    if (id) {
        found = await db
            .prepare('SELECT value FROM secrets WHERE id = ? AND user_handle = ? AND key_name = ?')
            .bind(id, event.locals.user.handle, key)
            .first<{ value: string }>();
    } else {
        found = await db
            .prepare('SELECT value FROM secrets WHERE user_handle = ? AND key_name = ? AND active = 1')
            .bind(event.locals.user.handle, key)
            .first<{ value: string }>();
    }

    return jsonOk({ value: found?.value || '' });
};
