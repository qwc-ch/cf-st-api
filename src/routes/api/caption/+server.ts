import { jsonError, jsonOk } from '../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { image } = body;
    if (!image) return jsonError(400, 'image is required');

    try {
        const ai = event.platform?.env?.AI;
        if (ai) {
            const result = await ai.run('@cf/unum/uform-gen2-qwen-500m', {
                image: image.replace(/^data:image\/\w+;base64,/, ''),
                prompt: 'Describe this image in detail.',
            });
            return jsonOk(result);
        }
    } catch {}

    return jsonOk({ description: 'No AI binding available.' });
};
