import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { url } = await event.request.json().catch(() => ({}));
    if (!url) return jsonError(400, 'url is required');

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'SillyTavern/1.0' },
            signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) return jsonError(response.status, 'Failed to fetch URL');

        const text = await response.text();
        const contentType = response.headers.get('content-type') || '';

        try {
            const data = JSON.parse(text);
            return jsonOk(data);
        } catch {
            return new Response(text, {
                headers: { 'Content-Type': contentType },
            });
        }
    } catch (e: any) {
        return jsonError(502, `Fetch error: ${e.message}`);
    }
};
