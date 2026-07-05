import { jsonError, jsonOk } from '../../../../../lib/auth';

const FAL_API = 'https://fal.run';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key, model, ...params } = body;
    if (!api_key) return jsonError(400, 'api_key is required');
    if (!model) return jsonError(400, 'model is required');

    try {
        const res = await fetch(`${FAL_API}/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Key ${api_key}`,
            },
            body: JSON.stringify(params),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const { request_id } = await res.json();

        let result;
        for (let i = 0; i < 60; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const sres = await fetch(`${FAL_API}/${model}/requests/${request_id}/status`, {
                headers: { Authorization: `Key ${api_key}` },
            });
            if (sres.ok) {
                const status = await sres.json();
                if (status.status === 'COMPLETED') {
                    const dres = await fetch(`${FAL_API}/${model}/requests/${request_id}`, {
                        headers: { Authorization: `Key ${api_key}` },
                    });
                    if (dres.ok) {
                        result = await dres.json();
                        break;
                    }
                }
            }
        }
        if (!result) return jsonError(504, 'Fal.ai generation timed out');
        return jsonOk(result);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
