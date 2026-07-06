import { jsonError, jsonOk } from '../../../../lib/auth';
import { getFile, listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { index, vector, topK = 5 } = body;
    if (!index) return jsonError(400, 'index is required');

    const prefix = `${event.locals.user.handle}/vectors/${index}/`;
    const keys = await listFiles(prefix);

    const results = [];
    for (const key of keys) {
        const file = await getFile(key);
        if (!file) continue;
        const text = await file.text();
        try {
            const entry = JSON.parse(text);
            results.push(entry);
        } catch {}
    }

    return jsonOk(results.slice(0, topK));
};
