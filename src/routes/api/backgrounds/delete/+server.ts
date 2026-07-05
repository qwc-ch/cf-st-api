import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { name } = await event.request.json().catch(() => ({}));
    if (!name) return jsonError(400, 'name is required');

    const db = getDb(event.platform!);
    await db
        .prepare('DELETE FROM backgrounds WHERE user_handle = ? AND name = ?')
        .bind(event.locals.user.handle, name)
        .run();
    return jsonOk({ ok: true });
};
