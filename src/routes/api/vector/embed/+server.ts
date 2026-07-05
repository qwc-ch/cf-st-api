import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { server, key, model, input } = body;
    if (!server || !key || !input) return jsonError(400, 'Missing required fields');

    try {
        const url = `${server.replace(/\/$/, '')}/embeddings`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'text-embedding-ada-002',
                input,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            return jsonError(res.status, `Embeddings API error: ${errorText}`);
        }

        const data = await res.json();
        return jsonOk({ model: data.model || model, embeddings: data.data?.[0]?.embedding || [] });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
