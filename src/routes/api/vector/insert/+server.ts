import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket, uploadFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { index, id, vector, metadata } = body;
    if (!index || !id) return jsonError(400, 'index and id are required');

    const key = `${event.locals.user.handle}/vectors/${index}/${id}.json`;
    const data = JSON.stringify({ id, vector, metadata, created: Date.now() });
    const bucket = getBucket(event.platform!);
    await uploadFile(bucket, key, new TextEncoder().encode(data), 'application/json');
    return jsonOk({ ok: true, key });
};
