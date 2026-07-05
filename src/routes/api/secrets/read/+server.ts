import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id } = body;

    const db = getDb(event.platform!);

    if (key) {
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
    }

    const all = await db
        .prepare('SELECT id, key_name, active, created FROM secrets WHERE user_handle = ? ORDER BY created')
        .bind(event.locals.user.handle)
        .all()
        .then((r) => r.results);
    return jsonOk(all);
};
