import { jsonError, jsonOk } from '../../../../../lib/auth';
import { listFiles } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const prefix = `${event.locals.user.handle}/backups/`;
    const keys = await listFiles(prefix);
    return jsonOk(
        keys.map((k) => ({
            key: k,
            name: k.split('/').pop(),
            created: 0,
        })),
    );
};
