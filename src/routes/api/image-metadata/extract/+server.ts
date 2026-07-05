import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { image_data } = body;
    if (!image_data) return jsonError(400, 'Missing image_data');

    return jsonOk({ width: 0, height: 0, format: 'unknown' });
};
