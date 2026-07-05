import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_url } = body;
    if (!api_url) return jsonError(400, 'api_url is required');

    try {
        const resp = await fetch(`${api_url.replace(/\/+$/, '')}/api/schedulers`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!resp.ok) return jsonError(502, 'Failed to fetch schedulers');
        const data = await resp.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
