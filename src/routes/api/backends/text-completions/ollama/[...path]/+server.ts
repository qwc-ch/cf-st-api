import { jsonError, jsonOk } from '../../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const url = new URL(event.request.url);
    const path = url.pathname.replace(/^\/api\/backends\/text-completions\/ollama\//, '');

    if (path === 'caption-image') {
        const { image, api_url } = body;
        if (!image) return jsonError(400, 'image is required');
        try {
            const targetUrl = api_url ? `${api_url}/api/caption` : 'http://localhost:11434/api/caption';
            const resp = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image }),
                signal: AbortSignal.timeout(30000),
            });
            if (!resp.ok) return jsonError(502, 'Caption failed');
            const data = await resp.json();
            return jsonOk(data);
        } catch (e: any) {
            return jsonError(502, `Error: ${e.message}`);
        }
    }

    if (path === 'download') {
        return jsonOk({ ok: false, error: 'download not available in cloud' });
    }

    return jsonError(404, 'Unknown ollama endpoint');
};
