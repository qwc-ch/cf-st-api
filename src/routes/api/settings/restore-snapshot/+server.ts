import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { value } = await event.request.json().catch(() => ({}));
    if (!value) return jsonError(400, 'value is required');

    await sql(
        'INSERT INTO settings (user_handle, value) VALUES ($1, $2) ON CONFLICT(user_handle) DO UPDATE SET value = excluded.value',
        [event.locals.user.handle, typeof value === 'string' ? value : JSON.stringify(value)],
    );

    return jsonOk({ ok: true });
};
