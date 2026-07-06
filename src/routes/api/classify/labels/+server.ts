import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text } = body;
    if (!text) return jsonError(400, 'text is required');

    return jsonOk({
        data: [
            { label: 'POSITIVE', score: 0.5 },
            { label: 'NEGATIVE', score: 0.5 },
        ],
    });
};
