import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const url = new URL(event.request.url);
    const path = url.pathname.replace(/^\/api\/speech\/pollinations\//, '');

    if (path === 'voices') {
        return jsonOk([
            { name: 'Alice', id: 'alice' },
            { name: 'Bob', id: 'bob' },
            { name: 'Charlie', id: 'charlie' },
        ]);
    }

    if (path === 'generate') {
        const { text, voice } = body;
        if (!text) return jsonError(400, 'text is required');
        const voiceId = voice || 'alice';
        try {
            const resp = await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}?voice=${voiceId}`, {
                signal: AbortSignal.timeout(30000),
            });
            if (!resp.ok) return jsonError(502, 'TTS failed');
            const audioBuffer = await resp.arrayBuffer();
            return new Response(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
        } catch (e: any) {
            return jsonError(502, `Error: ${e.message}`);
        }
    }

    return jsonError(404, 'Unknown pollinations endpoint');
};
