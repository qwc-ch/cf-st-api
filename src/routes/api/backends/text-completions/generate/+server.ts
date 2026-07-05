import { jsonError } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const body = await event.request.json().catch(() => ({}));
    const { api_server, ...params } = body;
    if (!api_server) return jsonError(400, 'api_server is required');

    try {
        const upstream = await fetch(`${api_server}/completion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
