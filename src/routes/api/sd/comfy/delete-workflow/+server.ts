import { jsonError, jsonOk } from '../../../../../lib/auth';
import { deleteFile } from '../../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name } = body;
    if (!name) return jsonError(400, 'name is required');

    const key = `${event.locals.user.handle}/sd-workflows/${name}`;
    await deleteFile(key);
    return jsonOk({ ok: true });
};
