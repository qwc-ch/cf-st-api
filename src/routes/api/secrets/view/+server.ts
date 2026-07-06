import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key } = body;

    if (!key) return jsonError(400, 'key is required');

    const secrets = (await sql(
        'SELECT id, key_name, value, label, active, created FROM secrets WHERE user_handle = $1 AND key_name = $2 ORDER BY created DESC',
        [event.locals.user.handle, key],
    )) as { id: string; key_name: string; value: string; label: string; active: number; created: number }[];

    const masked = secrets.map((s) => ({
        ...s,
        value: s.value.length > 3 ? '******' + s.value.slice(-3) : '******',
    }));

    return jsonOk({ secrets: masked });
};
