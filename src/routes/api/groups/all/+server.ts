import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getGroups } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const db = getDb(event.platform!);
    const groups = await getGroups(db, event.locals.user.handle);
    return jsonOk(groups);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const db = getDb(event.platform!);
    const groups = await getGroups(db, event.locals.user.handle);
    return jsonOk(groups);
};
