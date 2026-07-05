import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket, listFiles } from '../../../../lib/r2';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    try {
        const bucket = getBucket(event.platform!);
        const prefix = `${event.locals.user.handle}/sprites/`;
        const files = await listFiles(bucket, prefix);
        const sprites = files.map((key) => ({
            name: key.replace(prefix, ''),
            key,
        }));
        return jsonOk({ sprites });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
