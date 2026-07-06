import { jsonError, jsonOk } from '../../../../lib/auth';
import { updateUserAvatar } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { avatar_data } = body;
    if (!avatar_data) return jsonError(400, 'Missing avatar_data');

    try {
        await updateUserAvatar(event.locals.user.handle, avatar_data);
        return jsonOk({ ok: true, avatar_url: avatar_data });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
