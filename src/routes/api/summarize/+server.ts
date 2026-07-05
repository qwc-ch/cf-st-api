import { jsonError, jsonOk } from '../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text } = body;
    if (!text) return jsonError(400, 'text is required');

    try {
        const ai = event.platform?.env?.AI;
        if (ai) {
            const result = await ai.run('@cf/facebook/bart-large-cnn', { input_text: text, max_length: 200 });
            return jsonOk({ summary: result?.summary || result?.output || '' });
        }
    } catch {}

    const words = text.split(/\s+/);
    const summary = words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : '');
    return jsonOk({ summary });
};
