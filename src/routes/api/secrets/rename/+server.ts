import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id, label } = body;

    if (!key || !id || !label) return jsonError(400, 'key, id, and label are required');

    const db = getDb(event.platform!);

    await db
        .prepare('UPDATE secrets SET label = ? WHERE id = ? AND user_handle = ? AND key_name = ?')
        .bind(label, id, event.locals.user.handle, key)
        .run();

    return jsonOk({ ok: true });
};
