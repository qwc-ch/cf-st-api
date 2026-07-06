import { jsonError, jsonOk } from '../../../../../lib/auth';
import { deleteFile } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key } = body;
    if (!key) return jsonError(400, 'key is required');
    if (!key.startsWith(event.locals.user.handle + '/')) return jsonError(403, 'Access denied');

    await deleteFile(key);
    return jsonOk({ ok: true });
};
