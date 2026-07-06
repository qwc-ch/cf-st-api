import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteCharacter, getCharacterByAvatar, getCharacterById } from '../../../../lib/db';
import { deleteFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, avatar_url } = await event.request.json().catch(() => ({}));

    let char = null;
    if (id) {
        char = await getCharacterById(id, event.locals.user.handle);
    } else if (avatar_url) {
        char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
    }
    if (!char) return jsonError(404, 'Character not found');

    if (char.avatar_url) {
        const key = char.avatar_url.replace(/^\/api\/files\/raw\//, '');
        await deleteFile(key).catch(() => {});
    }

    await deleteCharacter(char.id, event.locals.user.handle);
    return jsonOk({ ok: true });
};
