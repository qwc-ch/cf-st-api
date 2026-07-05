import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key } = body;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (api_key) headers['xi-api-key'] = api_key;

    const url = new URL(event.request.url);
    const path = url.pathname.replace(/^\/api\/speech\/elevenlabs\//, '');

    try {
        if (path === 'voices') {
            const resp = await fetch('https://api.elevenlabs.io/v1/voices', { headers });
            if (!resp.ok) return jsonError(502, 'Failed to fetch voices');
            const data = await resp.json();
            return jsonOk(data.voices || []);
        }

        if (path === 'voices/add') {
            const { name, files } = body;
            if (!name) return jsonError(400, 'name is required');
            const form = new FormData();
            form.append('name', name);
            if (files) form.append('files', files);
            const resp = await fetch('https://api.elevenlabs.io/v1/voices/add', {
                method: 'POST',
                headers: api_key ? { 'xi-api-key': api_key } : {},
                body: form,
            });
            const data = await resp.json();
            return jsonOk(data);
        }

        if (path === 'voice-settings') {
            const voiceId = body.voice || '21m00Tcm4TlvDq8ikWAM';
            const resp = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}/settings`, { headers });
            if (!resp.ok) return jsonError(502, 'Failed to fetch settings');
            const data = await resp.json();
            return jsonOk(data);
        }

        if (path === 'synthesize') {
            const { text, voice, model_id, stability, similarity_boost } = body;
            if (!text) return jsonError(400, 'text is required');
            const voiceId = voice || '21m00Tcm4TlvDq8ikWAM';
            const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: { ...headers, Accept: 'audio/mpeg' },
                body: JSON.stringify({
                    text,
                    model_id: model_id || 'eleven_monolingual_v1',
                    voice_settings: { stability: stability || 0.5, similarity_boost: similarity_boost || 0.5 },
                }),
            });
            if (!resp.ok) return jsonError(502, 'TTS failed');
            const audioBuffer = await resp.arrayBuffer();
            return new Response(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
        }

        if (path === 'history') {
            const resp = await fetch('https://api.elevenlabs.io/v1/history', { headers });
            if (!resp.ok) return jsonError(502, 'Failed to fetch history');
            const data = await resp.json();
            return jsonOk(data.history || []);
        }

        if (path === 'history-audio') {
            const { history_item_id } = body;
            if (!history_item_id) return jsonError(400, 'history_item_id is required');
            const resp = await fetch(`https://api.elevenlabs.io/v1/history/${history_item_id}/audio`, {
                headers: { ...headers, Accept: 'audio/mpeg' },
            });
            if (!resp.ok) return jsonError(502, 'Failed to fetch audio');
            const audioBuffer = await resp.arrayBuffer();
            return new Response(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
        }

        return jsonError(404, 'Unknown elevenlabs endpoint');
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
