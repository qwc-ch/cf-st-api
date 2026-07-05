import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key } = body;

    try {
        const resp = await fetch('https://api.electronhub.ai/v1/models', {
            headers: api_key ? { Authorization: `Bearer ${api_key}` } : {},
        });
        if (!resp.ok) return jsonError(502, 'Failed to fetch models');
        const data = await resp.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
