import { jsonError, jsonOk } from '../../../../lib/auth';
import { getGroups } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const groups = await getGroups(event.locals.user.handle);
    return jsonOk(groups);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const groups = await getGroups(event.locals.user.handle);
    return jsonOk(groups);
};
