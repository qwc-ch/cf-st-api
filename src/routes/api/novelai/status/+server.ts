import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const { api_url, api_key } = await event.request.json().catch(() => ({}));
    if (!api_url) return jsonError(400, 'api_url is required');
    if (!api_key) return jsonError(400, 'api_key is required');

    try {
        const upstream = await fetch(`${api_url}/api/subscriptions/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${api_key}`,
            },
            signal: AbortSignal.timeout(10000),
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
