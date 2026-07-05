import { jsonError, jsonOk } from '../../../../lib/auth';
import { createChat, getDb, saveMessage } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { character_id, name, messages } = await event.request.json().catch(() => ({}));
    if (!character_id || !Array.isArray(messages)) return jsonError(400, 'character_id and messages are required');

    const db = getDb(event.platform!);
    const chat = await createChat(db, {
        user_handle: event.locals.user.handle,
        character_id,
        name: name || 'Imported Chat',
    });

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        await saveMessage(db, {
            chat_id: chat.id,
            role: msg.role || 'user',
            name: msg.name || '',
            content: msg.content || '',
            extra: msg.extra ? JSON.stringify(msg.extra) : null,
            message_id: msg.message_id ?? i,
        });
    }

    return jsonOk(chat);
};
