import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { url } = body;
    if (!url) return jsonError(400, 'url is required');

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SillyTavern/1.0)' },
            signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) return jsonError(502, `Failed to fetch URL: ${response.status}`);
        const text = await response.text();
        return jsonOk({ content: text });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
