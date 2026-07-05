import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, source_lang, target_lang, api_url, api_key } = body;
    if (!text || !target_lang) return jsonError(400, 'text and target_lang are required');

    try {
        const url = api_url || 'https://api.deeplx.com/translate';
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(api_key ? { Authorization: `Bearer ${api_key}` } : {}) },
            body: JSON.stringify({ text, source_lang: source_lang || 'auto', target_lang }),
        });
        if (!response.ok) return jsonError(502, 'Translation failed');
        const data = await response.json();
        return jsonOk({ translatedText: data.data || data.translatedText || '' });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
