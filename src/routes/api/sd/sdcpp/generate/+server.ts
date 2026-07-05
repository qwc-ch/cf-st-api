import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_server, ...params } = body;
    if (!api_server) return jsonError(400, 'api_server is required');

    try {
        const res = await fetch(`${api_server}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();
        const image = data.image || data.images?.[0] || data.data?.[0]?.b64_json;
        return jsonOk({ image });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
