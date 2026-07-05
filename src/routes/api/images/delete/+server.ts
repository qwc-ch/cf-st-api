import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteFile, getBucket } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    let { path, key } = body;
    if (!key && path) key = path;
    if (!key) return jsonError(400, 'key or path is required');

    if (!key.startsWith(event.locals.user.handle + '/')) return jsonError(403, 'Access denied');

    const bucket = getBucket(event.platform!);
    await deleteFile(bucket, key);
    return jsonOk({ ok: true });
};
