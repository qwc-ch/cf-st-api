import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket, getFile, listFiles } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { indices, vector, topK = 5 } = body;
    if (!indices || !Array.isArray(indices)) return jsonError(400, 'indices array is required');

    const bucket = getBucket(event.platform!);
    const allResults = [];

    for (const index of indices) {
        const prefix = `${event.locals.user.handle}/vectors/${index}/`;
        const keys = await listFiles(bucket, prefix);
        for (const key of keys) {
            const file = await getFile(bucket, key);
            if (!file) continue;
            const text = await file.text();
            try {
                allResults.push(JSON.parse(text));
            } catch {}
        }
    }

    return jsonOk(allResults.slice(0, topK));
};
