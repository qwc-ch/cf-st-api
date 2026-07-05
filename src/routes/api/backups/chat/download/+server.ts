import { jsonError } from '../../../../../lib/auth';
import { getBucket, getFile } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key } = body;
    if (!key) return jsonError(400, 'key is required');
    if (!key.startsWith(event.locals.user.handle + '/')) return jsonError(403, 'Access denied');

    const bucket = getBucket(event.platform!);
    const file = await getFile(bucket, key);
    if (!file) return jsonError(404, 'Backup not found');

    const buffer = await file.arrayBuffer();
    return new Response(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`,
        },
    });
};
