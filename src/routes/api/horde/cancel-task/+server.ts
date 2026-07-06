import { jsonError, jsonOk } from '../../../../lib/auth';

const HORDE_API = 'https://horde.koboldai.net/api/v2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { taskId } = body;
    if (!taskId) return jsonError(400, 'taskId is required');

    try {
        const res = await fetch(`${HORDE_API}/generate/text/status/${taskId}`, {
            method: 'DELETE',
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
