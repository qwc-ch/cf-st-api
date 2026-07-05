import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key, group_id, model, messages } = body;
    if (!api_key || !messages) return jsonError(400, 'Missing required fields');

    try {
        const groupPath = group_id ? `?GroupId=${group_id}` : '';
        const url = `https://api.minimax.chat/v1/text/chatcompletion${groupPath}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${api_key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'abab5.5-chat',
                messages,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            return jsonError(res.status, `MiniMax API error: ${errorText}`);
        }

        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
