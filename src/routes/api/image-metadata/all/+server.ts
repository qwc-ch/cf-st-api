import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket, listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const prefix = `${event.locals.user.handle}/images/`;
    const bucket = getBucket(event.platform!);
    const keys = await listFiles(bucket, prefix);
    return jsonOk(
        keys.map((k) => ({
            key: k,
            name: k.split('/').pop(),
            path: k,
            url: event.platform!.env.PUBLIC_R2_URL
                ? `${event.platform!.env.PUBLIC_R2_URL}/${k}`
                : `/api/files/raw/${k}`,
        })),
    );
};
