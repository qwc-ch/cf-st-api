import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { getBucket } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user?.admin) return jsonError(403, 'Admin required');

    const db = getDb(event.platform!);
    const bucket = getBucket(event.platform!);

    const [characters, chats, settings] = await Promise.all([
        db
            .prepare('SELECT * FROM characters WHERE user_handle = ?')
            .bind(event.locals.user.handle)
            .all()
            .then((r) => r.results),
        db
            .prepare('SELECT * FROM chats WHERE user_handle = ?')
            .bind(event.locals.user.handle)
            .all()
            .then((r) => r.results),
        db
            .prepare('SELECT * FROM settings WHERE user_handle = ?')
            .bind(event.locals.user.handle)
            .all()
            .then((r) => r.results),
    ]);

    const backup = { characters, chats, settings, timestamp: Date.now() };
    const backupKey = `backups/${event.locals.user.handle}-${Date.now()}.json`;

    await bucket.put(backupKey, JSON.stringify(backup), {
        httpMetadata: { contentType: 'application/json' },
    });

    return jsonOk({ path: backupKey });
};
