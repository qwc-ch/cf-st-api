import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteGroup } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    await deleteGroup(id, event.locals.user.handle);
    return jsonOk({ ok: true });
};
