import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, source_lang, target_lang, api_key } = body;
    if (!text || !target_lang) return jsonError(400, 'text and target_lang are required');

    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${api_key || ''}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: text, source: source_lang || '', target: target_lang, format: 'text' }),
        });
        if (!response.ok) return jsonError(502, 'Translation failed');
        const data = await response.json();
        const translatedText = data?.data?.translations?.[0]?.translatedText || '';
        return jsonOk({ translatedText });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
