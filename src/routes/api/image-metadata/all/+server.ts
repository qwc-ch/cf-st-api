import { jsonError, jsonOk } from '../../../../lib/auth';
import { listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const prefix = `${event.locals.user.handle}/images/`;
    const keys = await listFiles(prefix);
    return jsonOk(
        keys.map((k) => ({
            key: k,
            name: k.split('/').pop(),
            path: k,
            url: process.env.PUBLIC_STORAGE_URL ? `${process.env.PUBLIC_STORAGE_URL}/${k}` : `/api/files/raw/${k}`,
        })),
    );
};
