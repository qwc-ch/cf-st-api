import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteFile, getBucket } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { index, id } = body;
    if (!index || !id) return jsonError(400, 'index and id are required');

    const bucket = getBucket(event.platform!);
    const key = `${event.locals.user.handle}/vectors/${index}/${id}.json`;
    await deleteFile(bucket, key);
    return jsonOk({ ok: true });
};
