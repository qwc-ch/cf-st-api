import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key } = body;
    try {
        const resp = await fetch('https://openrouter.ai/api/v1/models', {
            headers: api_key ? { Authorization: `Bearer ${api_key}` } : {},
        });
        if (!resp.ok) return jsonError(502, 'Failed to fetch models');
        const data = await resp.json();
        const imageModels = (data.data || []).filter(
            (m: any) => m.id?.includes('dall-e') || m.id?.includes('flux') || m.id?.includes('stable-diffusion'),
        );
        return jsonOk({ data: imageModels });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
