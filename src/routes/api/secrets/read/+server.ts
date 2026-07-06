import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id } = body;

    if (key) {
        let found;
        if (id) {
            const rows = await sql('SELECT value FROM secrets WHERE id = $1 AND user_handle = $2 AND key_name = $3', [
                id,
                event.locals.user.handle,
                key,
            ]);
            found = (rows as { value: string }[])[0];
        } else {
            const rows = await sql(
                'SELECT value FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1',
                [event.locals.user.handle, key],
            );
            found = (rows as { value: string }[])[0];
        }
        return jsonOk({ value: found?.value || '' });
    }

    const all = await sql('SELECT id, key_name, active, created FROM secrets WHERE user_handle = $1 ORDER BY created', [
        event.locals.user.handle,
    ]);
    return jsonOk(all);
};
