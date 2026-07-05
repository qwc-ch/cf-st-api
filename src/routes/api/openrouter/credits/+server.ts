import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key } = body;

    if (!api_key) return jsonError(400, 'api_key is required');

    try {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            headers: { Authorization: `Bearer ${api_key}` },
        });
        if (!response.ok) return jsonError(502, 'Failed to fetch credits');
        const data = await response.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
