import { jsonError, jsonOk } from '../../../../../lib/auth';
import { sql } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { url, prompt } = body;
    if (!url) return jsonError(400, 'url is required');
    if (!prompt) return jsonError(400, 'prompt is required');

    try {
        const rows = await sql('SELECT value FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1', [
            event.locals.user.handle,
            'api_key_comfy_runpod',
        ]);
        const secret = (rows as { value: string }[])[0];
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
