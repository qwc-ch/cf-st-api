import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const db = getDb(event.platform!);
    const [charCount, chatCount, msgCount] = await Promise.all([
        db
            .prepare('SELECT COUNT(*) as c FROM characters WHERE user_handle = ?')
            .bind(event.locals.user.handle)
            .first<{ c: number }>(),
        db
            .prepare('SELECT COUNT(*) as c FROM chats WHERE user_handle = ?')
            .bind(event.locals.user.handle)
            .first<{ c: number }>(),
        db
            .prepare('SELECT COUNT(*) as c FROM messages m JOIN chats c ON c.id = m.chat_id WHERE c.user_handle = ?')
            .bind(event.locals.user.handle)
            .first<{ c: number }>(),
    ]);

    return jsonOk({
        characters: charCount?.c || 0,
        chats: chatCount?.c || 0,
        messages: msgCount?.c || 0,
    });
};
