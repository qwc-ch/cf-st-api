import { jsonError, jsonOk } from '../../../../lib/auth';
import { updateUserAvatar } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    try {
        await updateUserAvatar(event.locals.user.handle, '');
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
