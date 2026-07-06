import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name } = body;
    if (!name) return jsonError(400, 'Missing name');

    try {
        const key = `${event.locals.user.handle}/sprites/${name}`;
        await deleteFile(key);
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
