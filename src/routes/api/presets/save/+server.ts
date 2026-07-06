import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, apiId, preset } = body;

    if (!name || !preset) return jsonError(400, 'name and preset are required');

    const now = Date.now();
    const value = typeof preset === 'string' ? preset : JSON.stringify(preset);

    await sql(
        `INSERT INTO presets (user_handle, name, api_id, value, created, updated)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT(user_handle, name) DO UPDATE SET api_id = excluded.api_id, value = excluded.value, updated = excluded.updated`,
        [event.locals.user.handle, name, apiId ?? '', value, now, now],
    );

    return jsonOk({ name });
};
