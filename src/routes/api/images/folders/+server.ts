import { jsonError, jsonOk } from '../../../../lib/auth';
import { listPrefix } from '../../../../lib/r2';

export const POST = async (event) => {
    try {
        if (!event.locals.user) return jsonError(401, 'Unauthorized');
        const prefix = `${event.locals.user.handle}/images/`;
        const result = await listPrefix(prefix, '/');
        const folders = (result.delimitedPrefixes || []).map((p: string) => {
            const name = p.replace(prefix, '').replace(/\/$/, '');
            return { name, path: p };
        });
        return jsonOk(folders);
    } catch (e) {
        console.error('Failed to list image folders:', e);
        return jsonError(500, 'Failed to list image folders');
    }
};
