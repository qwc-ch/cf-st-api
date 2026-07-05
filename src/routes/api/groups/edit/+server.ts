import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, saveGroup } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, members, data } = body;
    if (!name) return jsonError(400, 'name is required');

    const db = getDb(event.platform!);
    const group = await saveGroup(db, {
        user_handle: event.locals.user.handle,
        name,
        members: JSON.stringify(members || []),
        data: JSON.stringify(data || {}),
    });
    return jsonOk(group);
};
