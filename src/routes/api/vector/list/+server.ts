import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket, listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const prefix = `${event.locals.user.handle}/vectors/${body?.index || ''}`;
    const bucket = getBucket(event.platform!);
    const files = await listFiles(bucket, prefix);
    return jsonOk(files.map((k) => ({ key: k, name: k.split('/').pop() })));
};
