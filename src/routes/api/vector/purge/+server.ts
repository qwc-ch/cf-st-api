import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteFile, listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { index } = body;
    if (!index) return jsonError(400, 'index is required');

    const prefix = `${event.locals.user.handle}/vectors/${index}/`;
    const keys = await listFiles(prefix);
    for (const key of keys) await deleteFile(key);
    return jsonOk({ ok: true, deleted: keys.length });
};
