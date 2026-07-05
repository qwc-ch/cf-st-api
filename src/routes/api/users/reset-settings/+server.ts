import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const db = getDb(event.platform!);
    await db
        .prepare(
            'INSERT INTO settings (user_handle, value) VALUES (?, ?) ON CONFLICT(user_handle) DO UPDATE SET value = excluded.value',
        )
        .bind(event.locals.user.handle, '{}')
        .run();

    return jsonOk({ ok: true });
};
