import { jsonError, jsonOk } from '../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text } = body;
    if (!text) return jsonError(400, 'text is required');

    const words = text.split(/\s+/);
    const summary = words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : '');
    return jsonOk({ summary });
};
