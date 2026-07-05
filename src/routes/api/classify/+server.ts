import { jsonError, jsonOk } from '../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text } = body;
    if (!text) return jsonError(400, 'text is required');

    try {
        const ai = event.platform?.env?.AI;
        if (ai) {
            const result = await ai.run('@cf/huggingface/distilbert-sst-2-int8', { inputs: text });
            return jsonOk(result);
        }
    } catch {}

    return jsonOk([
        { label: 'POSITIVE', score: 0.5 },
        { label: 'NEGATIVE', score: 0.5 },
    ]);
};
