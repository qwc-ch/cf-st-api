import { jsonError, jsonOk } from '../../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    return jsonOk({ data: [{ id: '@cf/baai/bge-base-en-v1.5', object: 'model' }] });
};
