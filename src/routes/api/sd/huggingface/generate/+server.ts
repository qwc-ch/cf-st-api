import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key, model, ...params } = body;
    if (!api_key) return jsonError(400, 'api_key is required');
    if (!model) return jsonError(400, 'model is required');

    try {
        const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${api_key}`,
            },
            body: JSON.stringify(params),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return jsonOk({ image: `data:image/png;base64,${base64}` });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
