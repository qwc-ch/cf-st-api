import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket, listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const folder = body.folder || '';

    const prefix = `${event.locals.user.handle}/images/${folder}`.replace(/\/+$/, '') + '/';
    const bucket = getBucket(event.platform!);
    const files = await listFiles(bucket, prefix);

    const results = files.map((key) => {
        const name = key.split('/').pop() || '';
        return {
            name,
            path: key,
            url: event.platform!.env.PUBLIC_R2_URL
                ? `${event.platform!.env.PUBLIC_R2_URL}/${key}`
                : `/api/files/raw/${key}`,
        };
    });

    return jsonOk(results);
};
