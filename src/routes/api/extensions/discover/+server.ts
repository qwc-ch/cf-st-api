import { requireAuth, jsonError, jsonOk } from '../../../../lib/auth';
import { discoverExtensions } from '../../../../lib/extensions';

export const GET = async (event) => {
    try {
        const user = requireAuth(event);
        const extensions = await discoverExtensions(user.handle);
        return jsonOk(extensions);
    } catch (err) {
        if (err instanceof Error && err.message === 'Unauthorized') {
            return jsonError(401, 'Unauthorized');
        }
        throw err;
    }
};
