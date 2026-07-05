import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text } = body;
    if (typeof text !== 'string') return jsonError(400, 'Missing text');

    const count = text.split(/\s+/).filter(Boolean).length;
    return jsonOk({ count });
};
