import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket, getFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key } = body;
    if (!key) return jsonError(400, 'key is required');

    const bucket = getBucket(event.platform!);
    const file = await getFile(bucket, key);
    return jsonOk({ exists: !!file, key });
};
