import { jsonError, jsonOk } from '../../../lib/auth';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    return jsonOk({ modules: [] });
};
