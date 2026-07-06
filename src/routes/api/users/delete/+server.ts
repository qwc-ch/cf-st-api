import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteUser } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user?.admin) return jsonError(403, 'Admin required');
    const { handle } = await event.request.json().catch(() => ({}));
    if (!handle) return jsonError(400, 'Handle is required');
    if (handle === event.locals.user.handle) return jsonError(400, 'Cannot delete yourself');

    await deleteUser(handle);
    return jsonOk({ ok: true });
};
