import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, color } = body;
    if (!name) return jsonError(400, 'name is required');

    const db = getDb(event.platform!);
    const now = Date.now();

    const existing = await db
        .prepare('SELECT id FROM tags WHERE user_handle = ? AND name = ?')
        .bind(event.locals.user.handle, name)
        .first();

    if (existing) {
        await db
            .prepare('UPDATE tags SET color = ?, created = ? WHERE user_handle = ? AND name = ?')
            .bind(color || '#808080', now, event.locals.user.handle, name)
            .run();
    } else {
        await db
            .prepare('INSERT INTO tags (user_handle, name, color, created) VALUES (?, ?, ?, ?)')
            .bind(event.locals.user.handle, name, color || '#808080', now)
            .run();
    }

    return jsonOk({ ok: true });
};
