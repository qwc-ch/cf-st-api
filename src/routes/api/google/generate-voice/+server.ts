import { jsonError } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const body = await event.request.json().catch(() => ({}));
    const { api_url, api_key, text, ...params } = body;
    if (!api_url) return jsonError(400, 'api_url is required');
    if (!text) return jsonError(400, 'text is required');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (api_key) headers['Authorization'] = `Bearer ${api_key}`;

    try {
        const upstream = await fetch(api_url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text, ...params }),
            signal: AbortSignal.timeout(60000),
        });

        if (!upstream.ok) {
            const textBody = await upstream.text().catch(() => '');
            return jsonError(upstream.status, textBody || `Upstream error: ${upstream.statusText}`);
        }

        const contentType = upstream.headers.get('content-type') || 'audio/mpeg';

        return new Response(upstream.body, {
            status: upstream.status,
            headers: { 'Content-Type': contentType },
        });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
