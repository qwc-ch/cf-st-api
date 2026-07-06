import { jsonError, jsonOk } from '../../../../lib/auth';
import { getWorldInfoById, saveWorldInfo, sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { id, name, entries } = body;

    if (id) {
        const existing = await getWorldInfoById(id, event.locals.user.handle);
        if (!existing) return jsonError(404, 'World info not found');
        const now = Date.now();
        await sql(
            'UPDATE world_infos SET entries = $1, name = COALESCE($2, name), updated = $3 WHERE id = $4 AND user_handle = $5',
            [JSON.stringify(entries || []), name || null, now, id, event.locals.user.handle],
        );
        return jsonOk({ ok: true });
    }

    if (!name) return jsonError(400, 'name is required');

    const wi = await saveWorldInfo({
        user_handle: event.locals.user.handle,
        name,
        entries: JSON.stringify(entries || []),
    });
    return jsonOk(wi);
};
