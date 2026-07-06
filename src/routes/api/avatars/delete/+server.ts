import { jsonError, jsonOk } from '../../../../lib/auth';
import { updateUserAvatar } from '../../../../lib/db';
import { deleteFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { avatar } = body;

    if (avatar) {
        const key = `${event.locals.user.handle}/avatar/${avatar}`;
        await deleteFile(key).catch(() => {});
        return jsonOk({ ok: true });
    }

    try {
        await updateUserAvatar(event.locals.user.handle, '');
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
