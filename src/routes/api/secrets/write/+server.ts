import crypto from 'node:crypto';
import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, value, label } = body;

    if (!key || !value) return jsonError(400, 'key and value are required');

    const db = getDb(event.platform!);
    const id = crypto.randomUUID();

    await db
        .prepare('UPDATE secrets SET active = 0 WHERE user_handle = ? AND key_name = ?')
        .bind(event.locals.user.handle, key)
        .run();

    await db
        .prepare(
            'INSERT INTO secrets (id, user_handle, key_name, value, label, active, created) VALUES (?, ?, ?, ?, ?, 1, ?)',
        )
        .bind(id, event.locals.user.handle, key, value, label ?? '', Date.now())
        .run();

    return jsonOk({ id });
};
