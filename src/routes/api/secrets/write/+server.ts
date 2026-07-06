import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, value, label } = body;

    if (!key || !value) return jsonError(400, 'key and value are required');

    const id = uuid();

    await sql('UPDATE secrets SET active = 0 WHERE user_handle = $1 AND key_name = $2', [
        event.locals.user.handle,
        key,
    ]);

    await sql(
        'INSERT INTO secrets (id, user_handle, key_name, value, label, active, created) VALUES ($1, $2, $3, $4, $5, 1, $6)',
        [id, event.locals.user.handle, key, value, label ?? '', Date.now()],
    );

    return jsonOk({ id });
};
