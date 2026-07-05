import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key } = body;

    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${api_key || ''}`);
        if (!response.ok) return jsonError(502, 'Failed to fetch voices');
        const data = await response.json();
        return jsonOk(data.voices || []);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
