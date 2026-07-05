import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { id, name } = body;
    if (!id || !name) return jsonError(400, 'id and name are required');

    const db = getDb(event.platform!);
    const result = await db
        .prepare('UPDATE backgrounds SET name = ? WHERE id = ? AND user_handle = ?')
        .bind(name, id, event.locals.user.handle)
        .run();

    if (result.meta.changes === 0) return jsonError(404, 'Background not found');
    return jsonOk({ ok: true });
};
