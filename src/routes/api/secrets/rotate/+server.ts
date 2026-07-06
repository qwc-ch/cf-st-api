import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id } = body;

    if (!key || !id) return jsonError(400, 'key and id are required');

    await sql('UPDATE secrets SET active = 0 WHERE user_handle = $1 AND key_name = $2', [
        event.locals.user.handle,
        key,
    ]);

    await sql('UPDATE secrets SET active = 1 WHERE id = $1 AND user_handle = $2', [id, event.locals.user.handle]);

    return jsonOk({ ok: true });
};
