import { jsonError } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, voice, api_key, group_id } = body;
    if (!text) return jsonError(400, 'text is required');

    try {
        const resp = await fetch('https://api.minimax.chat/v1/text_to_speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${api_key || ''}`,
            },
            body: JSON.stringify({
                text,
                voice_id: voice || 'male-qnzuo',
                model: 'speech-01',
                speed: 1.0,
                vol: 1.0,
                pitch: 0,
            }),
            signal: AbortSignal.timeout(30000),
        });
        if (!resp.ok) return jsonError(502, 'TTS failed');
        const audioBuffer = await resp.arrayBuffer();
        return new Response(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
