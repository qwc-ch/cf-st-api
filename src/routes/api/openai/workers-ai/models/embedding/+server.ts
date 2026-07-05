import { jsonError, jsonOk } from '../../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    try {
        const ai = event.platform?.env?.AI;
        if (ai) {
            const models = await ai.models.list();
            return jsonOk({ data: models });
        }
    } catch {}
    return jsonOk({ data: [{ id: '@cf/baai/bge-base-en-v1.5', object: 'model' }] });
};
