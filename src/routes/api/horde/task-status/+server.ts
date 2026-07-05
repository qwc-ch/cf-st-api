import { jsonError, jsonOk } from '../../../../lib/auth';

const HORDE_API = 'https://horde.koboldai.net/api/v2';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const id = event.url.searchParams.get('id');
    if (!id) return jsonError(400, 'id query param is required');

    try {
        const res = await fetch(`${HORDE_API}/generate/text/status/${id}`);
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
