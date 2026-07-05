import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const db = getDb(event.platform!);
    const snapshots = await db
        .prepare('SELECT name, created FROM settings_snapshots WHERE user_handle = ? ORDER BY created DESC')
        .bind(event.locals.user.handle)
        .all()
        .then((r) => r.results);

    return jsonOk(snapshots);
};
