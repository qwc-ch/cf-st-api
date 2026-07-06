import { jsonError, jsonOk } from '../../../../lib/auth';
import { getSettings, sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const value = await getSettings(event.locals.user.handle);

    const now = Date.now();
    const name = `snapshot-${now}`;
    await sql('INSERT INTO settings_snapshots (user_handle, name, value, created) VALUES ($1, $2, $3, $4)', [
        event.locals.user.handle,
        name,
        value || '{}',
        now,
    ]);

    return jsonOk({ name });
};
