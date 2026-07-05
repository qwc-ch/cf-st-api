import { jsonError } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key, text, model, voice } = body;

    if (!api_key) return jsonError(400, 'api_key is required');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model || 'models/gemini-pro'}:streamGenerateContent?key=${api_key}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text || '' }] }],
                    generationConfig: { voice, responseModalities: ['AUDIO'] },
                }),
            },
        );
        if (!response.ok) {
            const errText = await response.text();
            return jsonError(502, `TTS failed: ${errText}`);
        }
        const audioBuffer = await response.arrayBuffer();
        return new Response(audioBuffer, {
            status: 200,
            headers: { 'Content-Type': 'audio/mpeg' },
        });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
