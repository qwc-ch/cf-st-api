import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const url = new URL(event.request.url);
    const path = url.pathname.replace(/^\/api\/plugins\/edge-tts\//, '');

    const { api_url } = body;
    const baseUrl = api_url ? api_url.replace(/\/+$/, '') : 'http://localhost:8001';

    try {
        if (path === 'list') {
            const resp = await fetch(`${baseUrl}/list`, { signal: AbortSignal.timeout(10000) });
            if (!resp.ok) return jsonOk({ voices: [] });
            const data = await resp.json();
            return jsonOk(data);
        }

        if (path === 'generate') {
            const { text, voice, rate, pitch } = body;
            const resp = await fetch(`${baseUrl}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text || '',
                    voice: voice || 'en-US-JennyNeural',
                    rate: rate || 0,
                    pitch: pitch || 0,
                }),
                signal: AbortSignal.timeout(60000),
            });
            if (!resp.ok) return jsonError(502, 'TTS failed');
            const audioBuffer = await resp.arrayBuffer();
            return new Response(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
        }

        if (path === 'probe') {
            const resp = await fetch(`${baseUrl}/probe`, { signal: AbortSignal.timeout(10000) });
            return jsonOk({ ok: resp.ok });
        }

        return jsonError(404, 'Unknown edge-tts endpoint');
    } catch (e: any) {
        return jsonOk({ error: e.message });
    }
};
