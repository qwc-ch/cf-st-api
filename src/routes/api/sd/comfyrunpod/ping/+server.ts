import { jsonError, jsonOk } from '../../../../../lib/auth';
import { sql } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { url } = body;
    if (!url) return jsonError(400, 'url is required');

    try {
        const rows = await sql('SELECT value FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1', [
            event.locals.user.handle,
            'api_key_comfy_runpod',
        ]);
        const secret = (rows as { value: string }[])[0];
        const apiKey = secret?.value || '';

        const res = await fetch(url, {
            method: 'GET',
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        });
        if (!res.ok && res.status !== 404 && res.status !== 401)
            return jsonError(res.status, 'RunPod endpoint not reachable');
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
