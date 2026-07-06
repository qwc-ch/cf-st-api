import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteChat, getCharacterByAvatar, getChatByName, getChatsForCharacter } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, chatfile, avatar_url, character_id } = await event.request.json().catch(() => ({}));

    if (id) {
        await deleteChat(id, event.locals.user.handle);
        return jsonOk({ ok: true });
    }

    if (!chatfile || !avatar_url) return jsonError(400, 'chatfile and avatar_url are required');

    const char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
    if (!char) return jsonError(404, 'Character not found');

    const chatName = chatfile.replace(/\.jsonl$/i, '');
    const chat = await getChatByName(event.locals.user.handle, char.id, chatName);
    if (!chat) return jsonError(404, 'Chat not found');

    await deleteChat(chat.id, event.locals.user.handle);
    return jsonOk({ ok: true });
};
