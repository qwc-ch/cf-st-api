import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const path = new URL(event.request.url).pathname;

    if (path.endsWith('/probe')) {
        return jsonOk({ ok: true, format: body.url?.split('.').pop() || 'unknown' });
    }

    if (path.endsWith('/parse')) {
        const { url } = body;
        if (!url) return jsonError(400, 'url is required');
        try {
            const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
            const text = await resp.text();
            return jsonOk({ content: text, title: url.split('/').pop() });
        } catch (e: any) {
            return jsonError(502, `Error: ${e.message}`);
        }
    }

    return jsonError(404, 'Unknown office endpoint');
};
