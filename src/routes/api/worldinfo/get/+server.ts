import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getWorldInfos } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const db = getDb(event.platform!);
    const list = await getWorldInfos(db, event.locals.user.handle);
    return jsonOk(list);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const db = getDb(event.platform!);
    const list = await getWorldInfos(db, event.locals.user.handle);
    return jsonOk(list);
};
