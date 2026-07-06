import { jsonError, jsonOk } from '../../../../lib/auth';
import { getChatsForCharacter } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    const chats = await getChatsForCharacter(event.locals.user.handle, id);
    return jsonOk(chats);
};
