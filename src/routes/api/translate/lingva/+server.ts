import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, source_lang, target_lang, api_url } = body;
    if (!text || !target_lang) return jsonError(400, 'text and target_lang are required');

    try {
        const url = api_url
            ? `${api_url}/api/v1/${source_lang || 'auto'}/${target_lang}/${encodeURIComponent(text)}`
            : `https://lingva.ml/api/v1/${source_lang || 'auto'}/${target_lang}/${encodeURIComponent(text)}`;
        const response = await fetch(url);
        if (!response.ok) return jsonError(502, 'Translation failed');
        const data = await response.json();
        return jsonOk({ translatedText: data.translation || '' });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
