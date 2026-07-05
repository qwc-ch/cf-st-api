import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getUserByHandle } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Not logged in');

    const db = getDb(event.platform!);
    const user = await getUserByHandle(db, event.locals.user.handle);
    if (!user) return jsonError(404, 'User not found');

    return jsonOk({ handle: user.handle, name: user.name, admin: !!user.admin, avatar_url: user.avatar_url });
};
