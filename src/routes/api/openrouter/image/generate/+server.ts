import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { prompt, model, api_key } = body;
    if (!prompt) return jsonError(400, 'prompt is required');

    try {
        const resp = await fetch('https://openrouter.ai/api/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(api_key ? { Authorization: `Bearer ${api_key}` } : {}),
            },
            body: JSON.stringify({ prompt, model: model || 'dall-e-3', n: 1 }),
        });
        if (!resp.ok) return jsonError(502, 'Image generation failed');
        const data = await resp.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
