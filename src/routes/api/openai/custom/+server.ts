import { jsonError } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, voice, api_key, api_url } = body;
    if (!text) return jsonError(400, 'text is required');

    try {
        const url = api_url || 'https://api.openai.com/v1/audio/speech';
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(api_key ? { Authorization: `Bearer ${api_key}` } : {}),
            },
            body: JSON.stringify({ input: text, voice: voice || 'alloy', model: 'tts-1' }),
        });
        if (!resp.ok) return jsonError(502, 'TTS failed');
        const audioBuffer = await resp.arrayBuffer();
        return new Response(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
