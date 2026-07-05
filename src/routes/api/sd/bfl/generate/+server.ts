import { jsonError, jsonOk } from '../../../../../lib/auth';

const BFL_API = 'https://api.bfl.ml/v1';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key, ...params } = body;
    if (!api_key) return jsonError(400, 'api_key is required');

    try {
        const res = await fetch(`${BFL_API}/image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': api_key,
            },
            body: JSON.stringify(params),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const { id } = await res.json();
        if (!id) return jsonError(500, 'No task id returned');

        let result;
        for (let i = 0; i < 60; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const sres = await fetch(`${BFL_API}/result?id=${id}`, {
                headers: { 'x-api-key': api_key },
            });
            if (sres.ok) {
                result = await sres.json();
                if (result.status === 'ready' || result.status === 'success') break;
            }
        }
        if (!result) return jsonError(504, 'BFL generation timed out');
        return jsonOk(result);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
