import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const prefix = `${event.locals.user.handle}/backgrounds/`;
    const bucket = getBucket(event.platform!);
    const objects = await bucket.list({ prefix, delimiter: '/' });
    const folders = (objects.delimitedPrefixes || []).map((p: string) => {
        const name = p.replace(prefix, '').replace(/\/$/, '');
        return { name, path: p };
    });
    return jsonOk(folders);
};
