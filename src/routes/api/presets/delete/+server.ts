import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name } = body;

    if (!name) return jsonError(400, 'name is required');

    await sql('DELETE FROM presets WHERE user_handle = $1 AND name = $2', [event.locals.user.handle, name]);

    return jsonOk({ ok: true });
};
