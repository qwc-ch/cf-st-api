import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, source_lang, target_lang, service } = body;
    if (!text || !target_lang || !service) return jsonError(400, 'Missing required fields');

    try {
        let translatedText = '';

        switch (service) {
            case 'google': {
                const apiKey = body.api_key;
                if (!apiKey) return jsonError(400, 'Missing api_key for Google Translate');
                const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        q: text,
                        source: source_lang || 'auto',
                        target: target_lang,
                    }),
                });
                const data = await res.json();
                translatedText = data?.data?.translations?.[0]?.translatedText || '';
                break;
            }
            case 'libre': {
                const libreUrl = body.api_url || 'https://libretranslate.com';
                const res = await fetch(`${libreUrl}/translate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        q: text,
                        source: source_lang || 'auto',
                        target: target_lang,
                    }),
                });
                const data = await res.json();
                translatedText = data?.translatedText || '';
                break;
            }
            case 'deepl': {
                const apiKey = body.api_key;
                if (!apiKey) return jsonError(400, 'Missing api_key for DeepL');
                const res = await fetch('https://api-free.deepl.com/v2/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `DeepL-Auth-Key ${apiKey}`,
                    },
                    body: JSON.stringify({
                        text: [text],
                        source_lang: source_lang || undefined,
                        target_lang: target_lang,
                    }),
                });
                const data = await res.json();
                translatedText = data?.translations?.[0]?.text || '';
                break;
            }
            default:
                return jsonError(400, `Unsupported service: ${service}`);
        }

        return jsonOk({ translated_text: translatedText });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
