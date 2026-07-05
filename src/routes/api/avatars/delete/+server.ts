import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, updateUserAvatar } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    try {
        const db = getDb(event.platform!);
        await updateUserAvatar(db, event.locals.user.handle, '');
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
