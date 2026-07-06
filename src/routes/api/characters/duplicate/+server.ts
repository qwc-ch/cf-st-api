import { jsonError, jsonOk } from '../../../../lib/auth';
import { createCharacter, getCharacterByAvatar, getCharacterById } from '../../../../lib/db';
import { copyFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, avatar_url, name } = await event.request.json().catch(() => ({}));

    let original = null;
    if (id) {
        original = await getCharacterById(id, event.locals.user.handle);
    } else if (avatar_url) {
        original = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
    }
    if (!original) return jsonError(404, 'Character not found');

    const newName = name || `${original.name} (Copy)`;
    const oldAvatar = original.avatar_url;
    const newAvatar = `${newName}.png`;

    const dup = await createCharacter({
        ...original,
        user_handle: event.locals.user.handle,
        name: newName,
        avatar_url: newAvatar,
    });

    if (oldAvatar && oldAvatar !== newAvatar) {
        const oldKey = oldAvatar.replace(/^\/api\/files\/raw\//, '');
        const newKey = newAvatar.replace(/^\/api\/files\/raw\//, '');
        await copyFile(oldKey, newKey).catch(() => {});
    }

    return jsonOk({ path: newAvatar, ...dup });
};
