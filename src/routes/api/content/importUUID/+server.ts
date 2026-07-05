import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { uuid } = body;
    if (!uuid) return jsonError(400, 'uuid is required');

    try {
        const response = await fetch(`https://api.uuidhub.io/v1/content/${uuid}`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) return jsonError(502, 'Failed to fetch UUID content');
        const data = await response.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
