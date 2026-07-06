import { jsonError, jsonOk } from '../../../../../lib/auth';
import { listFiles } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const prefix = `${event.locals.user.handle}/sd-workflows/`;
    const keys = await listFiles(prefix);
    return jsonOk(keys.map((k) => ({ name: k.replace(prefix, ''), key: k })));
};
