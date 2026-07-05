import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const body = await event.request.json().catch(() => ({}));
    const { api_url, api_key, prompt, ...params } = body;
    if (!api_url) return jsonError(400, 'api_url is required');
    if (!api_key) return jsonError(400, 'api_key is required');
    if (!prompt) return jsonError(400, 'prompt is required');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    try {
        const upstream = await fetch(api_url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ prompt, ...params }),
            signal: AbortSignal.timeout(60000),
        });

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => '');
            return jsonError(upstream.status, text || `Upstream error: ${upstream.statusText}`);
        }

        const result = await upstream.json();
        const operationName = result.name;

        if (!operationName) {
            return jsonOk(result);
        }

        const maxAttempts = 60;
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise((r) => setTimeout(r, 5000));
            const pollRes = await fetch(`${api_url.replace(/\/v1.*$/, '')}/v1/${operationName}`, {
                headers,
                signal: AbortSignal.timeout(30000),
            });
            if (!pollRes.ok) {
                return jsonError(pollRes.status, 'Polling failed');
            }
            const pollData = await pollRes.json();
            if (pollData.done || pollData.state === 'SUCCEEDED') {
                return jsonOk(pollData);
            }
            if (pollData.state === 'FAILED') {
                return jsonError(500, 'Video generation failed');
            }
        }

        return jsonError(504, 'Polling timed out');
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
