import { jsonError, jsonOk } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { url, prompt } = body;
    if (!url) return jsonError(400, 'url is required');
    if (!prompt) return jsonError(400, 'prompt is required');

    try {
        const db = getDb(event.platform!);
        const secret = await db
            .prepare('SELECT value FROM secrets WHERE user_handle = ? AND key_name = ? AND active = 1')
            .bind(event.locals.user.handle, 'api_key_comfy_runpod')
            .first<{ value: string }>();
        const apiKey = secret?.value || '';
        if (!apiKey) return jsonError(401, 'RunPod API key not found. Please set it in Secrets.');

        let parsedPrompt;
        try {
            parsedPrompt = JSON.parse(prompt);
        } catch {
            return jsonError(400, 'Invalid prompt JSON');
        }

        const res = await fetch(`${url}/runsync`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: parsedPrompt }),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();

        if (data.status === 'FAILED') return jsonError(500, data?.output?.message || 'RunPod generation failed');

        const output = data.output || {};
        const images = output.images || output.output || [];

        if (Array.isArray(images) && images.length > 0) {
            const img = images[0];
            if (img.image) {
                return jsonOk({ format: img.format || 'png', data: img.image });
            }
        }

        if (typeof output === 'string' && output.length > 100) {
            return jsonOk({ format: 'png', data: output });
        }

        return jsonOk({ format: 'png', data: JSON.stringify(output) });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
