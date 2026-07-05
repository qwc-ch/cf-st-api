import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key, region, voice } = body;

    try {
        const url = region
            ? `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`
            : 'https://eastus.tts.speech.microsoft.com/cognitiveservices/voices/list';

        const response = await fetch(url, {
            headers: { 'Ocp-Apim-Subscription-Key': api_key || '' },
        });

        if (!response.ok) return jsonError(502, 'Failed to fetch voices');
        const voices = await response.json();

        if (voice) {
            const filtered = voices.filter(
                (v: any) =>
                    v.Locale?.toLowerCase().includes(voice.toLowerCase()) ||
                    v.ShortName?.toLowerCase().includes(voice.toLowerCase()),
            );
            return jsonOk(filtered.length > 0 ? filtered : voices);
        }

        return jsonOk(voices);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
