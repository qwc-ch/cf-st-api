import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const { api_server } = await event.request.json().catch(() => ({}));
    if (!api_server) return jsonError(400, 'api_server is required');

    try {
        const response = await fetch(`${api_server}/props`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) return jsonOk({ max_context_length: 4096 });

        const data = await response.json();
        return jsonOk(data);
    } catch {
        return jsonOk({ max_context_length: 4096 });
    }
};
