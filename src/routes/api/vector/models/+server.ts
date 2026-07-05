import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { server, key } = body;
    if (!server || !key) return jsonError(400, 'Missing server or key');

    try {
        const url = `${server.replace(/\/$/, '')}/models`;
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            return jsonError(res.status, `Models API error: ${errorText}`);
        }

        const data = await res.json();
        return jsonOk({ models: data.data || [] });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
