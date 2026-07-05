import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_server } = body;
    if (!api_server) return jsonError(400, 'api_server is required');

    try {
        const res = await fetch(api_server, { method: 'GET' });
        if (!res.ok) return jsonError(res.status, 'DrawThings not reachable');
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
