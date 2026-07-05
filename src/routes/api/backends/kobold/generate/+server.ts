import { jsonError } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const body = await event.request.json().catch(() => ({}));
    const { api_server, api_key, streaming, prompt, ...params } = body;
    if (!api_server) return jsonError(400, 'api_server is required');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (api_key) headers['Authorization'] = `Bearer ${api_key}`;

    try {
        const endpoint = streaming ? `${api_server}/extra/generate/stream` : `${api_server}/v1/generate`;

        const payload = streaming ? { prompt, ...params } : { prompt, ...params };

        const upstream = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(60000),
        });

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => '');
            return jsonError(upstream.status, text || `Upstream error: ${upstream.statusText}`);
        }

        if (streaming) {
            const contentType = upstream.headers.get('content-type') || 'text/event-stream';
            return new Response(upstream.body, {
                status: upstream.status,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
            });
        }

        const data = await upstream.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
