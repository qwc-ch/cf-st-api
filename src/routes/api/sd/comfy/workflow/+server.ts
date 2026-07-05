import { jsonError, jsonOk } from '../../../../../lib/auth';
import { getBucket, getFile } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name } = body;
    if (!name) return jsonError(400, 'name is required');

    const key = `${event.locals.user.handle}/sd-workflows/${name}`;
    const bucket = getBucket(event.platform!);
    const file = await getFile(bucket, key);
    if (!file) return jsonError(404, 'Workflow not found');
    const text = await file.text();
    try {
        return jsonOk(JSON.parse(text));
    } catch {
        return jsonOk({ content: text });
    }
};
