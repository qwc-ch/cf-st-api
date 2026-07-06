import { jsonError, jsonOk } from '../../../../lib/auth';
import { getGroups } from '../../../../lib/db';

function enrichGroup(group: any): any {
    let data = {};
    try {
        data = JSON.parse(group.data || '{}');
    } catch {}
    let members: any[] = [];
    try {
        members = JSON.parse(group.members || '[]');
    } catch {}
    return {
        ...data,
        id: group.id,
        name: group.name,
        members,
        user_handle: group.user_handle,
        created: group.created,
        updated: group.updated,
    };
}

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const groups = await getGroups(event.locals.user.handle);
    return jsonOk(groups.map(enrichGroup));
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const groups = await getGroups(event.locals.user.handle);
    return jsonOk(groups.map(enrichGroup));
};
