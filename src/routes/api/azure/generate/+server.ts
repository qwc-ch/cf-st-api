import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_url, api_key, model, messages } = body;
    if (!api_url || !api_key || !messages) return jsonError(400, 'Missing required fields');

    try {
        const url = `${api_url.replace(/\/$/, '')}/openai/deployments/${model}/chat/completions?api-version=2024-02-15-preview`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'api-key': api_key,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            return jsonError(res.status, `Azure API error: ${errorText}`);
        }

        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
