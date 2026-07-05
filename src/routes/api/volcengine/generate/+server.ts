import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { app_id, access_key, model, messages } = body;
    if (!access_key || !messages) return jsonError(400, 'Missing required fields');

    try {
        const url = `https://ark.cn-beijing.volces.com/api/v3/chat/completions`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'doubao-pro-32k',
                messages,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            return jsonError(res.status, `Volcengine API error: ${errorText}`);
        }

        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
