import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getCharacterById } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, avatar_url } = await event.request.json().catch(() => ({}));

    let character = null;
    if (id) {
        character = await getCharacterById(id, event.locals.user.handle);
    } else if (avatar_url) {
        character = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
    } else {
        return jsonError(400, 'id or avatar_url is required');
    }

    if (!character) return jsonError(404, 'Character not found');
    return jsonOk(character);
};
