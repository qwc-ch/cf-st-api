import { jsonError } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_url, api_key, model, input, voice, backend } = body;
    if (!backend || !input || !api_key) return jsonError(400, 'Missing required fields');

    try {
        let url = '';
        const headers: Record<string, string> = {};
        let requestBody: any = {};

        switch (backend) {
            case 'elevenlabs': {
                const voiceId = voice || '21m00Tcm4TlvDq8ikWAM';
                url = `${api_url || 'https://api.elevenlabs.io'}/v1/text-to-speech/${voiceId}`;
                headers['Accept'] = 'audio/mpeg';
                headers['Content-Type'] = 'application/json';
                headers['xi-api-key'] = api_key;
                requestBody = { text: input, model_id: model || 'eleven_monolingual_v1' };
                break;
            }
            case 'azure': {
                url = `${api_url || 'https://eastus.tts.speech.microsoft.com'}/cognitiveservices/v1`;
                headers['Ocp-Apim-Subscription-Key'] = api_key;
                headers['Content-Type'] = 'application/ssml+xml';
                const ssml = `<speak version='1.0' xml:lang='en-US'><voice name='${voice || 'en-US-JennyNeural'}'>${input}</voice></speak>`;
                requestBody = ssml;
                break;
            }
            case 'openai': {
                url = `${api_url || 'https://api.openai.com'}/v1/audio/speech`;
                headers['Authorization'] = `Bearer ${api_key}`;
                headers['Content-Type'] = 'application/json';
                requestBody = { model: model || 'tts-1', input, voice: voice || 'alloy' };
                break;
            }
            default:
                return jsonError(400, `Unsupported backend: ${backend}`);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            return jsonError(response.status, `TTS API error: ${errorText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'audio/mpeg';

        return new Response(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
