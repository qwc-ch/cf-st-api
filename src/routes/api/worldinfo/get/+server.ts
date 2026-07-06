import { jsonError, jsonOk } from '../../../../lib/auth';
import { getWorldInfos } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const list = await getWorldInfos(event.locals.user.handle);
    return jsonOk(list);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const list = await getWorldInfos(event.locals.user.handle);
    return jsonOk(list);
};
