import { jsonError } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, voice, api_key, api_url } = body;
    if (!text) return jsonError(400, 'text is required');

    try {
        const url = api_url || 'https://api.elevenlabs.io/v1/text-to-speech/' + (voice || '21m00Tcm4TlvDq8ikWAM');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(api_key ? { 'xi-api-key': api_key } : {}),
            },
            body: JSON.stringify({ text, model_id: 'eleven_monolingual_v1' }),
        });
        if (!response.ok) return jsonError(502, 'TTS failed');
        const audioBuffer = await response.arrayBuffer();
        return new Response(audioBuffer, {
            status: 200,
            headers: { 'Content-Type': 'audio/mpeg' },
        });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
