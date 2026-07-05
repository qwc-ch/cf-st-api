import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { prompt, api_key } = body;
    if (!prompt) return jsonError(400, 'prompt is required');

    try {
        const resp = await fetch('https://koboldai.org/ai/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(api_key ? { Authorization: `Bearer ${api_key}` } : {}),
            },
            body: JSON.stringify({ prompt, max_length: body.max_length || 200 }),
            signal: AbortSignal.timeout(60000),
        });
        if (!resp.ok) return jsonError(502, 'Generation failed');
        const data = await resp.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
