import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getSettings } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const db = getDb(event.platform!);
    const value = await getSettings(db, event.locals.user.handle);

    const now = Date.now();
    const name = `snapshot-${now}`;
    await db
        .prepare('INSERT INTO settings_snapshots (user_handle, name, value, created) VALUES (?, ?, ?, ?)')
        .bind(event.locals.user.handle, name, value || '{}', now)
        .run();

    return jsonOk({ name });
};
