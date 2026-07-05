import { jsonError } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { text, voice, api_key, api_url } = body;
    if (!text) return jsonError(400, 'text is required');

    const url = api_url || 'http://localhost:5000/tts';
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(api_key ? { Authorization: `Bearer ${api_key}` } : {}) },
            body: JSON.stringify({ text, voice: voice || 'default' }),
            signal: AbortSignal.timeout(60000),
        });
        if (!resp.ok) return jsonError(502, 'TTS failed');
        const audioBuffer = await resp.arrayBuffer();
        return new Response(audioBuffer, {
            status: 200,
            headers: { 'Content-Type': resp.headers.get('content-type') || 'audio/wav' },
        });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
