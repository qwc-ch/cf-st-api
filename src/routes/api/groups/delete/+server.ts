import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteGroup, getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    const db = getDb(event.platform!);
    await deleteGroup(db, id, event.locals.user.handle);
    return jsonOk({ ok: true });
};
