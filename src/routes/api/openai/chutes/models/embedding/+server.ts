import { jsonError, jsonOk } from '../../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    return jsonOk({ data: [{ id: 'text-embedding-ada-002', object: 'model' }] });
};
