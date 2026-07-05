import { jsonError, jsonOk } from '../../../../lib/auth';

const HORDE_API = 'https://horde.koboldai.net/api/v2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key, image_data } = body;
    if (!api_key) return jsonError(400, 'api_key is required');
    if (!image_data) return jsonError(400, 'image_data is required');

    try {
        const res = await fetch(`${HORDE_API}/interrogate/async`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: api_key,
            },
            body: JSON.stringify({ image_data }),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
