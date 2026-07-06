import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, color } = body;
    if (!name) return jsonError(400, 'name is required');

    const now = Date.now();

    const existingRows = (await sql('SELECT id FROM tags WHERE user_handle = $1 AND name = $2', [
        event.locals.user.handle,
        name,
    ])) as { id: number }[];
    const existing = existingRows[0];

    if (existing) {
        await sql('UPDATE tags SET color = $1, created = $2 WHERE user_handle = $3 AND name = $4', [
            color || '#808080',
            now,
            event.locals.user.handle,
            name,
        ]);
    } else {
        await sql('INSERT INTO tags (user_handle, name, color, created) VALUES ($1, $2, $3, $4)', [
            event.locals.user.handle,
            name,
            color || '#808080',
            now,
        ]);
    }

    return jsonOk({ ok: true });
};
