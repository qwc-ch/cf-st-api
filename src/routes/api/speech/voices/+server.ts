import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { backend, api_key } = body;
    if (!backend) return jsonError(400, 'Missing backend');

    try {
        let voices: { name: string; id: string }[] = [];

        switch (backend) {
            case 'elevenlabs': {
                if (!api_key) return jsonError(400, 'Missing api_key');
                const res = await fetch('https://api.elevenlabs.io/v1/voices', {
                    headers: { 'xi-api-key': api_key },
                });
                if (!res.ok) return jsonError(502, 'Failed to fetch voices');
                const data = await res.json();
                voices = (data.voices || []).map((v: any) => ({ name: v.name, id: v.voice_id }));
                break;
            }
            case 'azure': {
                voices = [
                    { name: 'Jenny (English US)', id: 'en-US-JennyNeural' },
                    { name: 'Guy (English US)', id: 'en-US-GuyNeural' },
                    { name: 'Sonia (English UK)', id: 'en-GB-SoniaNeural' },
                    { name: 'Ryan (English UK)', id: 'en-GB-RyanNeural' },
                ];
                break;
            }
            case 'openai': {
                voices = [
                    { name: 'Alloy', id: 'alloy' },
                    { name: 'Echo', id: 'echo' },
                    { name: 'Fable', id: 'fable' },
                    { name: 'Onyx', id: 'onyx' },
                    { name: 'Nova', id: 'nova' },
                    { name: 'Shimmer', id: 'shimmer' },
                ];
                break;
            }
            default:
                return jsonError(400, `Unsupported backend: ${backend}`);
        }

        return jsonOk({ voices });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
