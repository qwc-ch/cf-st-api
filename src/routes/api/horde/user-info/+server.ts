import { jsonError, jsonOk } from '../../../../lib/auth';

const HORDE_API = 'https://horde.koboldai.net/api/v2';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const api_key = event.url.searchParams.get('api_key');
    if (!api_key) return jsonError(400, 'api_key query param is required');

    try {
        const res = await fetch(`${HORDE_API}/find_user`, {
            headers: { apikey: api_key },
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
