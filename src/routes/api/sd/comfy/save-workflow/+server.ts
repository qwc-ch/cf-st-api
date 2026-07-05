import { jsonError, jsonOk } from '../../../../../lib/auth';
import { getBucket, uploadFile } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, workflow } = body;
    if (!name || !workflow) return jsonError(400, 'name and workflow are required');

    const key = `${event.locals.user.handle}/sd-workflows/${name}`;
    const data = typeof workflow === 'string' ? workflow : JSON.stringify(workflow);
    const bucket = getBucket(event.platform!);
    await uploadFile(bucket, key, new TextEncoder().encode(data), 'application/json');
    return jsonOk({ ok: true, key });
};
