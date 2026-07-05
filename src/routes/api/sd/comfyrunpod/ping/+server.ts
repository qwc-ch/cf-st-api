import { jsonError, jsonOk } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { url } = body;
    if (!url) return jsonError(400, 'url is required');

    try {
        const db = getDb(event.platform!);
        const secret = await db
            .prepare('SELECT value FROM secrets WHERE user_handle = ? AND key_name = ? AND active = 1')
            .bind(event.locals.user.handle, 'api_key_comfy_runpod')
            .first<{ value: string }>();
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
