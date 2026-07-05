import { jsonError } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, voice, api_key } = body;
    if (!text) return jsonError(400, 'text is required');

    try {
        const resp = await fetch('https://api.electronhub.ai/v1/audio/speech', {
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
