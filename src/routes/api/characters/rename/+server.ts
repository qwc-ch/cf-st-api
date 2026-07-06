import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getCharacterById, updateCharacter } from '../../../../lib/db';
import { copyFile, moveFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, avatar_url, name, new_name } = await event.request.json().catch(() => ({}));

    const resolvedName = name || new_name;
    if (!resolvedName) return jsonError(400, 'name is required');

    let char = null;
    if (id) {
        char = await getCharacterById(id, event.locals.user.handle);
    } else if (avatar_url) {
        char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
    }
    if (!char) return jsonError(404, 'Character not found');

    const oldAvatar = char.avatar_url;
    const newAvatar = resolvedName ? `${resolvedName}.png` : char.avatar_url;

    if (resolvedName) {
        await updateCharacter(char.id, event.locals.user.handle, {
            name: resolvedName,
            avatar_url: newAvatar,
        });
    }

    if (oldAvatar && oldAvatar !== newAvatar) {
        const oldKey = oldAvatar.replace(/^\/api\/files\/raw\//, '');
        const newKey = newAvatar.replace(/^\/api\/files\/raw\//, '');
        await moveFile(oldKey, newKey).catch(() => {});
    }

    return jsonOk({ avatar: newAvatar, ok: true });
};
