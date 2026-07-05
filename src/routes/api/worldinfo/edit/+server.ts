import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getWorldInfoById, saveWorldInfo } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { id, name, entries } = body;

    if (id) {
        const db = getDb(event.platform!);
        const existing = await getWorldInfoById(db, id, event.locals.user.handle);
        if (!existing) return jsonError(404, 'World info not found');
        const now = Date.now();
        await db
            .prepare(
                'UPDATE world_infos SET entries = ?, name = COALESCE(?, name), updated = ? WHERE id = ? AND user_handle = ?',
            )
            .bind(JSON.stringify(entries || []), name || null, now, id, event.locals.user.handle)
            .run();
        return jsonOk({ ok: true });
    }

    if (!name) return jsonError(400, 'name is required');

    const db = getDb(event.platform!);
    const wi = await saveWorldInfo(db, {
        user_handle: event.locals.user.handle,
        name,
        entries: JSON.stringify(entries || []),
    });
    return jsonOk(wi);
};
