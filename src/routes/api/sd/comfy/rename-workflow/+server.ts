import { jsonError, jsonOk } from '../../../../../lib/auth';
import { deleteFile, getBucket, getFile, uploadFile } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, new_name } = body;
    if (!name || !new_name) return jsonError(400, 'name and new_name are required');

    const oldKey = `${event.locals.user.handle}/sd-workflows/${name}`;
    const newKey = `${event.locals.user.handle}/sd-workflows/${new_name}`;
    const bucket = getBucket(event.platform!);

    const file = await getFile(bucket, oldKey);
    if (!file) return jsonError(404, 'Workflow not found');

    const data = await file.arrayBuffer();
    await uploadFile(bucket, newKey, data, 'application/json');
    await deleteFile(bucket, oldKey);
    return jsonOk({ ok: true, key: newKey });
};
