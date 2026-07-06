import { jsonError, jsonOk } from '../../../../lib/auth';
import { listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const subfolder = body.folder || '';
    const prefix = `${event.locals.user.handle}/assets/${subfolder}`.replace(/\/+$/, '') + '/';
    const keys = await listFiles(prefix);
    return jsonOk(
        keys.map((k) => ({
            key: k,
            name: k.split('/').pop(),
            url: process.env.PUBLIC_STORAGE_URL ? `${process.env.PUBLIC_STORAGE_URL}/${k}` : `/api/files/raw/${k}`,
        })),
    );
};
