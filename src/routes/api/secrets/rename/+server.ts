import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id, label } = body;

    if (!key || !id || !label) return jsonError(400, 'key, id, and label are required');

    await sql('UPDATE secrets SET label = $1 WHERE id = $2 AND user_handle = $3 AND key_name = $4', [
        label,
        id,
        event.locals.user.handle,
        key,
    ]);

    return jsonOk({ ok: true });
};
