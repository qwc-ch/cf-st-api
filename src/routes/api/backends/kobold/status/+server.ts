import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const { api_server, api_key } = await event.request.json().catch(() => ({}));
    if (!api_server) return jsonError(400, 'api_server is required');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (api_key) headers['Authorization'] = `Bearer ${api_key}`;

    try {
        const [versionRes, extraRes, modelRes] = await Promise.allSettled([
            fetch(`${api_server}/v1/info/version`, { headers, signal: AbortSignal.timeout(10000) }),
            fetch(`${api_server}/extra/version`, { headers, signal: AbortSignal.timeout(10000) }),
            fetch(`${api_server}/v1/model`, { headers, signal: AbortSignal.timeout(10000) }),
        ]);

        const result: Record<string, any> = {};

        if (versionRes.status === 'fulfilled' && versionRes.value.ok) {
            result.version = await versionRes.value.json().catch(() => null);
        }

        if (extraRes.status === 'fulfilled' && extraRes.value.ok) {
            result.extra = await extraRes.value.json().catch(() => null);
        }

        if (modelRes.status === 'fulfilled' && modelRes.value.ok) {
            result.model = await modelRes.value.json().catch(() => null);
        }

        return jsonOk({ online: true, ...result });
    } catch {
        return jsonOk({ online: false });
    }
};
