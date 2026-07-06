import { jsonError, jsonOk } from '../../../../lib/auth';
import { saveGroup } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    if (!body.name) return jsonError(400, 'name is required');

    const group = await saveGroup({
        user_handle: event.locals.user.handle,
        name: body.name,
        members: JSON.stringify(body.members || []),
        data: JSON.stringify(body.data || {}),
    });
    return jsonOk(group);
};
