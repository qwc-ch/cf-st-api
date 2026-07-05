import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { video_id } = body;
    if (!video_id) return jsonError(400, 'video_id is required');

    try {
        const response = await fetch(`https://youtubetranscript.com/?v=${encodeURIComponent(video_id)}`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) return jsonError(502, 'Failed to fetch transcript');
        const text = await response.text();
        return jsonOk({ transcript: text });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
