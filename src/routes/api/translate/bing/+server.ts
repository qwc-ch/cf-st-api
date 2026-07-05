import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, source_lang, target_lang, api_key } = body;
    if (!text || !target_lang) return jsonError(400, 'text and target_lang are required');

    try {
        const response = await fetch(
            'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0' +
                `&to=${target_lang}${source_lang ? `&from=${source_lang}` : ''}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': api_key || '',
                },
                body: JSON.stringify([{ text }]),
            },
        );
        if (!response.ok) return jsonError(502, 'Translation failed');
        const data = await response.json();
        return jsonOk({ translatedText: data?.[0]?.translations?.[0]?.text || '' });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
