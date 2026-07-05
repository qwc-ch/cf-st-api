import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, updateUserName } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { name } = await event.request.json().catch(() => ({}));
    if (!name) return jsonError(400, 'name is required');

    const db = getDb(event.platform!);
    await updateUserName(db, event.locals.user.handle, name);
    return jsonOk({ ok: true });
};
