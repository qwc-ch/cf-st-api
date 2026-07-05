import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const url = new URL(event.request.url);
    const path = url.pathname.replace(/^\/api\/text-to-speech\/coqui\//, '');

    const { api_url } = body;
    const baseUrl = api_url ? api_url.replace(/\/+$/, '') : 'http://localhost:5000';

    try {
        if (path === 'check-model-state' || path === 'coqui-api/check-model-state') {
            const resp = await fetch(`${baseUrl}/coqui-api/check-model-state`, {
                signal: AbortSignal.timeout(10000),
            });
            if (!resp.ok) return jsonOk({ state: 'not_loaded' });
            const data = await resp.json();
            return jsonOk(data);
        }

        if (path === 'install-model' || path === 'coqui-api/install-model') {
            const { model_name } = body;
            const resp = await fetch(`${baseUrl}/coqui-api/install-model`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model_name: model_name || 'tts_models/en/ljspeech/tacotron2-DDC' }),
                signal: AbortSignal.timeout(300000),
            });
            const data = await resp.json();
            return jsonOk(data);
        }

        if (path === 'get-models' || path === 'local/get-models') {
            const resp = await fetch(`${baseUrl}/local/get-models`, { signal: AbortSignal.timeout(10000) });
            if (!resp.ok) return jsonOk({ models: [] });
            const data = await resp.json();
            return jsonOk(data);
        }

        if (path === 'generate-tts') {
            const { text, speaker_id, model_name } = body;
            const resp = await fetch(`${baseUrl}/generate-tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text || '', speaker_id: speaker_id || '', model_name: model_name || '' }),
                signal: AbortSignal.timeout(60000),
            });
            if (!resp.ok) return jsonError(502, 'TTS failed');
            const audioBuffer = await resp.arrayBuffer();
            return new Response(audioBuffer, {
                status: 200,
                headers: { 'Content-Type': resp.headers.get('content-type') || 'audio/wav' },
            });
        }

        return jsonError(404, 'Unknown coqui endpoint');
    } catch (e: any) {
        return jsonOk({ error: e.message });
    }
};
