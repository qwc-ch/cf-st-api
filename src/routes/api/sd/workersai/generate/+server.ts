import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { model, ...params } = body;
    if (!model) return jsonError(400, 'model is required');

    try {
        const ai = event.platform?.env?.AI;
        if (!ai) return jsonError(500, 'Workers AI binding not available');

        const inputs = { prompt: params.prompt, ...params };
        // @ts-expect-error
        const result = await ai.run(model, inputs);
        return jsonOk(result);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
