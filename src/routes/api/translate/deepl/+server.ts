import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, source_lang, target_lang, api_key, api_url } = body;
    if (!text || !target_lang) return jsonError(400, 'text and target_lang are required');

    try {
        const url = api_url || 'https://api-free.deepl.com/v2/translate';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(api_key ? { Authorization: `DeepL-Auth-Key ${api_key}` } : {}),
            },
            body: JSON.stringify({
                text: [text],
                source_lang: source_lang ? source_lang.toUpperCase() : undefined,
                target_lang: target_lang.toUpperCase(),
            }),
        });
        if (!response.ok) return jsonError(502, 'Translation failed');
        const data = await response.json();
        return jsonOk({ translatedText: data?.translations?.[0]?.text || '' });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
