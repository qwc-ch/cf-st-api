import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteFile, getBucket, listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { index } = body;
    if (!index) return jsonError(400, 'index is required');

    const prefix = `${event.locals.user.handle}/vectors/${index}/`;
    const bucket = getBucket(event.platform!);
    const keys = await listFiles(bucket, prefix);
    for (const key of keys) await deleteFile(bucket, key);
    return jsonOk({ ok: true, deleted: keys.length });
};
