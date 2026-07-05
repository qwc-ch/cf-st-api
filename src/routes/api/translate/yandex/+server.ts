import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, source_lang, target_lang, api_key } = body;
    if (!text || !target_lang) return jsonError(400, 'text and target_lang are required');

    try {
        const response = await fetch('https://translate.api.cloud.yandex.net/translate/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(api_key ? { Authorization: `Bearer ${api_key}` } : {}),
            },
            body: JSON.stringify({
                texts: [text],
                sourceLanguageCode: source_lang || undefined,
                targetLanguageCode: target_lang,
                folderId: body.folder_id || '',
            }),
        });
        if (!response.ok) return jsonError(502, 'Translation failed');
        const data = await response.json();
        return jsonOk({ translatedText: data?.translations?.[0]?.text || '' });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
