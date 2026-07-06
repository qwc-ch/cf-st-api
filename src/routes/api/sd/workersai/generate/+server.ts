import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { model, ...params } = body;
    if (!model) return jsonError(400, 'model is required');

    return jsonError(501, 'Workers AI not available on this platform');
};
