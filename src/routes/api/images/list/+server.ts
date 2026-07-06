import { jsonError, jsonOk } from '../../../../lib/auth';
import { listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    try {
        if (!event.locals.user) return jsonError(401, 'Unauthorized');
        const body = await event.request.json().catch(() => ({}));
        const folder = body.folder || '';

        const prefix = `${event.locals.user.handle}/images/${folder}`.replace(/\/+$/, '') + '/';
        const files = await listFiles(prefix);

        const results = files.map((key) => {
            const name = key.split('/').pop() || '';
            return {
                name,
                path: key,
                url: process.env.PUBLIC_STORAGE_URL
                    ? `${process.env.PUBLIC_STORAGE_URL}/${key}`
                    : `/api/files/raw/${key}`,
            };
        });

        return jsonOk(results);
    } catch (e) {
        console.error('Failed to list images:', e);
        return jsonError(500, 'Failed to list images');
    }
};
