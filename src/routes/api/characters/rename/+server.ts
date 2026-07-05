import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, updateCharacter } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, name } = await event.request.json().catch(() => ({}));
    if (!id || !name) return jsonError(400, 'id and name are required');

    const db = getDb(event.platform!);
    await updateCharacter(db, id, event.locals.user.handle, { name });
    return jsonOk({ ok: true });
};
