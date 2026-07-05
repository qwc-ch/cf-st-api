import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getUserByHandle } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { handle } = await event.request.json().catch(() => ({}));
    if (!handle) return jsonError(400, 'handle is required');

    const db = getDb(event.platform!);
    const user = await getUserByHandle(db, handle);
    if (!user) return jsonError(404, 'User not found');

    return jsonOk({
        handle: user.handle,
        name: user.name,
        admin: !!user.admin,
        enabled: !!user.enabled,
        created: user.created,
        avatar_url: user.avatar_url,
        has_password: !!user.password_hash,
    });
};
