import { jsonError, jsonOk } from '../../../../lib/auth';
import { createChat, deleteMessages, getChatById, saveMessage } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { id, character_id, name, messages } = body;

    let chatId = id;
    if (chatId) {
        const existing = await getChatById(chatId, event.locals.user.handle);
        if (!existing) return jsonError(404, 'Chat not found');
        await deleteMessages(chatId);
    } else if (character_id) {
        const chat = await createChat({
            user_handle: event.locals.user.handle,
            character_id,
            name: name || 'New Chat',
        });
        chatId = chat.id;
    } else {
        return jsonError(400, 'id or character_id is required');
    }

    if (Array.isArray(messages)) {
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            await saveMessage({
                chat_id: chatId,
                role: msg.role || 'user',
                name: msg.name || '',
                content: msg.content || '',
                extra: msg.extra ? JSON.stringify(msg.extra) : null,
                message_id: msg.message_id ?? i,
            });
        }
    }

    return jsonOk({ id: chatId });
};
