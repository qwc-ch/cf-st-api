import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id } = body;

    if (!key) return jsonError(400, 'key is required');

    const db = getDb(event.platform!);
    let deleteId = id;

    if (!deleteId) {
        const active = await db
            .prepare('SELECT id FROM secrets WHERE user_handle = ? AND key_name = ? AND active = 1')
            .bind(event.locals.user.handle, key)
            .first<{ id: string }>();
        if (active) deleteId = active.id;
    }

    if (deleteId) {
        await db
            .prepare('DELETE FROM secrets WHERE id = ? AND user_handle = ?')
            .bind(deleteId, event.locals.user.handle)
            .run();
    }

    const remaining = await db
        .prepare('SELECT id, active FROM secrets WHERE user_handle = ? AND key_name = ? ORDER BY created ASC')
        .bind(event.locals.user.handle, key)
        .all<{ id: string; active: number }>()
        .then((r) => r.results);

    if (remaining.length > 0 && !remaining.some((r) => r.active === 1)) {
        await db.prepare('UPDATE secrets SET active = 1 WHERE id = ?').bind(remaining[0].id).run();
    }

    return jsonOk({ ok: true });
};
