import { jsonError, jsonOk } from '../../../../../lib/auth';
import { getBucket, listFiles } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const prefix = `${event.locals.user.handle}/backups/`;
    const bucket = getBucket(event.platform!);
    const keys = await listFiles(bucket, prefix);
    return jsonOk(
        keys.map((k) => ({
            key: k,
            name: k.split('/').pop(),
            created: 0,
        })),
    );
};
