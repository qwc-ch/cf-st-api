import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, listUsers } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user?.admin) return jsonError(403, 'Admin required');

    const db = getDb(event.platform!);
    const users = await listUsers(db);
    return jsonOk(users);
};
