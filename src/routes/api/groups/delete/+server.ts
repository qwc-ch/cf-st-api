import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteGroup, getGroups } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, name } = await event.request.json().catch(() => ({}));

    if (id) {
        await deleteGroup(id, event.locals.user.handle);
        return jsonOk({ ok: true });
    }

    if (name) {
        const groups = await getGroups(event.locals.user.handle);
        const group = groups.find((g: any) => g.name === name);
        if (group) {
            await deleteGroup(group.id, event.locals.user.handle);
        }
        return jsonOk({ ok: true });
    }

    return jsonError(400, 'id or name is required');
};
