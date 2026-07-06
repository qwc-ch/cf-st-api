import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getCharacterById, getChatsForCharacter } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, avatar_url } = await event.request.json().catch(() => ({}));

    let characterId = id;
    if (!characterId && avatar_url) {
        const char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
        if (!char) return jsonError(404, 'Character not found');
        characterId = char.id;
    }
    if (!characterId) return jsonError(400, 'id or avatar_url is required');

    const chats = await getChatsForCharacter(event.locals.user.handle, characterId);
    const result: Record<string, any> = {};
    for (const c of chats) {
        result[c.name] = {
            file_name: `${c.name}.jsonl`,
            last_mes: c.updated,
            chat_id: c.id,
        };
    }
    return jsonOk(result);
};
