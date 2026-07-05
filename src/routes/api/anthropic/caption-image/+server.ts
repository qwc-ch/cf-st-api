import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const body = await event.request.json().catch(() => ({}));
    const { api_url, api_key, image_data, ...params } = body;
    if (!api_url) return jsonError(400, 'api_url is required');
    if (!api_key) return jsonError(400, 'api_key is required');
    if (!image_data) return jsonError(400, 'image_data is required');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': api_key,
    };

    try {
        const upstream = await fetch(api_url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ image_data, ...params }),
            signal: AbortSignal.timeout(60000),
        });

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => '');
            return jsonError(upstream.status, text || `Upstream error: ${upstream.statusText}`);
        }

        const data = await upstream.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
