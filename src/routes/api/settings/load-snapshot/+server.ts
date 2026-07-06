import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { name } = await event.request.json().catch(() => ({}));
    if (!name) return jsonError(400, 'name is required');

    const rows = await sql('SELECT value FROM settings_snapshots WHERE user_handle = $1 AND name = $2', [
        event.locals.user.handle,
        name,
    ]);
    const snapshot = (rows as { value: string }[])[0];
    if (!snapshot) return jsonError(404, 'Snapshot not found');

    await sql(
        'INSERT INTO settings (user_handle, value) VALUES ($1, $2) ON CONFLICT (user_handle) DO UPDATE SET value = EXCLUDED.value',
        [event.locals.user.handle, snapshot.value],
    );

    try {
        return jsonOk(JSON.parse(snapshot.value));
    } catch {
        return jsonOk({});
    }
};
