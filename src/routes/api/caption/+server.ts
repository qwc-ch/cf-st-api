import { jsonError, jsonOk } from '../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { image } = body;
    if (!image) return jsonError(400, 'image is required');

    return jsonOk({ description: 'No AI binding available (Workers AI not available on this platform).' });
};
