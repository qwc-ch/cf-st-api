import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteWorldInfo, getWorldInfoByName } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, name } = await event.request.json().catch(() => ({}));

    if (id) {
        await deleteWorldInfo(id, event.locals.user.handle);
        return jsonOk({ ok: true });
    }

    if (name) {
        const wi = await getWorldInfoByName(event.locals.user.handle, name);
        if (wi) {
            await deleteWorldInfo(wi.id, event.locals.user.handle);
        }
        return jsonOk({ ok: true });
    }

    return jsonError(400, 'id or name is required');
};
