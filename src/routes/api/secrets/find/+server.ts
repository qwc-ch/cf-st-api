import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key } = body;

    if (!key) return jsonError(400, 'key is required');

    const rows = await sql('SELECT value FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1', [
        event.locals.user.handle,
        key,
    ]);
    const found = (rows as { value: string }[])[0];

    return jsonOk({ secret: found?.value || '' });
};
