import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteChat } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    await deleteChat(id, event.locals.user.handle);
    return jsonOk({ ok: true });
};
