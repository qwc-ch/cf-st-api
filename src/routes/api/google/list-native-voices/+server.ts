import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key } = body;

    if (!api_key) return jsonError(400, 'api_key is required');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${api_key}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) return jsonError(502, 'Failed to fetch models');
        const data = await response.json();
        const nativeVoices = (data.models || [])
            .filter((m: any) => m.name?.includes('models/'))
            .map((m: any) => ({ name: m.name, displayName: m.displayName }));
        return jsonOk(nativeVoices);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
