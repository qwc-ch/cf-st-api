import { jsonError } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const body = await event.request.json().catch(() => ({}));
    const { api_url, api_key, ...params } = body;
    if (!api_url) return jsonError(400, 'api_url is required');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (api_key) headers['Authorization'] = `Bearer ${api_key}`;

    try {
        const upstream = await fetch(api_url, {
            method: 'POST',
            headers,
            body: JSON.stringify(params),
        });

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => '');
            return jsonError(upstream.status, text || `Upstream error: ${upstream.statusText}`);
        }

        const contentType = upstream.headers.get('content-type') || 'text/event-stream';

        return new Response(upstream.body, {
            status: upstream.status,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (e: any) {
        return jsonError(502, `Proxy error: ${e.message}`);
    }
};
