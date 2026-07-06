import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteFile } from '../../../../lib/r2';

export const POST = async (event) => {
    try {
        if (!event.locals.user) return jsonError(401, 'Unauthorized');
        const body = await event.request.json().catch(() => ({}));
        let { path, key } = body;
        if (!key && path) key = path;
        if (!key) return jsonError(400, 'key or path is required');

        if (!key.startsWith(event.locals.user.handle + '/')) return jsonError(403, 'Access denied');

        await deleteFile(key);
        return jsonOk({ ok: true });
    } catch (e) {
        console.error('Failed to delete image:', e);
        return jsonError(500, 'Failed to delete image');
    }
};
