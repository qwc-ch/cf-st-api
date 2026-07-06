import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    await sql(
        'INSERT INTO settings (user_handle, value) VALUES ($1, $2) ON CONFLICT(user_handle) DO UPDATE SET value = excluded.value',
        [event.locals.user.handle, '{}'],
    );

    return jsonOk({ ok: true });
};
