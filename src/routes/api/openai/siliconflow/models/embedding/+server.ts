import { jsonError, jsonOk } from '../../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key } = body;
    try {
        const resp = await fetch('https://api.siliconflow.cn/v1/models', {
            headers: api_key ? { Authorization: `Bearer ${api_key}` } : {},
        });
        if (!resp.ok) return jsonOk({ data: [{ id: 'BAAI/bge-m3', object: 'model' }] });
        const data = await resp.json();
        return jsonOk(data);
    } catch {
        return jsonOk({ data: [{ id: 'BAAI/bge-m3', object: 'model' }] });
    }
};
