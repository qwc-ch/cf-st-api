import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key, ...params } = body;
    if (!api_key) return jsonError(400, 'api_key is required');

    try {
        const res = await fetch('https://api.z.ai/v1/video/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${api_key}`,
            },
            body: JSON.stringify(params),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const { id } = await res.json();
        if (!id) return jsonError(500, 'No task id returned');

        let result;
        for (let i = 0; i < 120; i++) {
            await new Promise((r) => setTimeout(r, 3000));
            const sres = await fetch(`https://api.z.ai/v1/video/status?id=${id}`, {
                headers: { Authorization: `Bearer ${api_key}` },
            });
            if (sres.ok) {
                result = await sres.json();
                if (result.status === 'completed' || result.status === 'succeeded') break;
            }
        }
        if (!result) return jsonError(504, 'Z.ai video generation timed out');
        return jsonOk(result);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
