import { jsonError, jsonOk } from '../../../../lib/auth';
import {
    createChat,
    deleteMessages,
    getCharacterByAvatar,
    getChatByName,
    getMessages,
    saveMessage,
} from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { ch_name, file_name, chat: chatArray, avatar_url, force } = body;

    if (!file_name || !avatar_url) return jsonError(400, 'file_name and avatar_url are required');

    const char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
    if (!char) return jsonError(404, 'Character not found');

    const chatName = file_name.replace(/\.jsonl$/i, '');
    let chat = await getChatByName(event.locals.user.handle, char.id, chatName);

    if (!chat) {
        chat = await createChat({
            user_handle: event.locals.user.handle,
            character_id: char.id,
            name: chatName,
        });
    } else if (!force) {
        const existingMsgs = await getMessages(chat.id);
        if (existingMsgs.length > 0) {
            return jsonOk({ error: 'integrity' });
        }
    }

    await deleteMessages(chat.id);

    if (Array.isArray(chatArray)) {
        const messages = chatArray.filter((_: any, i: number) => i > 0 || !chatArray[0]?.chat_metadata);
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            await saveMessage({
                chat_id: chat.id,
                role: msg.role || 'user',
                name: msg.name || '',
                content: msg.content || '',
                extra: msg.extra ? (typeof msg.extra === 'string' ? msg.extra : JSON.stringify(msg.extra)) : null,
                message_id: msg.message_id ?? i,
            });
        }
    }

    return jsonOk({ ok: true });
};
