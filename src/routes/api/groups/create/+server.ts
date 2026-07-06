import { jsonError, jsonOk } from '../../../../lib/auth';
import { saveGroup } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    if (!body.name) return jsonError(400, 'name is required');

    const { name, members } = body;

    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
        if (key !== 'name' && key !== 'members' && key !== 'id') {
            data[key] = value;
        }
    }

    const group = await saveGroup({
        user_handle: event.locals.user.handle,
        name,
        members: JSON.stringify(members || []),
        data: JSON.stringify(data),
    });

    return jsonOk({ ...group, ...data, members: members || [] });
};
