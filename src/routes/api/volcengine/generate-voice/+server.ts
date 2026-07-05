import { jsonError } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, voice, api_key, api_url } = body;
    if (!text) return jsonError(400, 'text is required');

    try {
        const url = api_url || 'https://openspeech.bytedance.com/api/v1/tts';
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${api_key || ''}`,
            },
            body: JSON.stringify({
                app: { appid: body.app_id || '' },
                user: { uid: body.uid || 'anonymous' },
                request: {
                    text,
                    voice_type: voice || 'BV001_streaming',
                    operation: 'query',
                },
            }),
            signal: AbortSignal.timeout(30000),
        });
        if (!resp.ok) return jsonError(502, 'TTS failed');
        const data = await resp.json();
        if (data?.data) {
            const audioBuffer = Uint8Array.from(atob(data.data), (c) => c.charCodeAt(0));
            return new Response(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
        }
        const audioBuffer = await resp.arrayBuffer();
        return new Response(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
