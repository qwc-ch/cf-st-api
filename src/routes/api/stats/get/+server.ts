import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const [charRows, chatRows, msgRows] = await Promise.all([
        sql('SELECT COUNT(*) as c FROM characters WHERE user_handle = $1', [event.locals.user.handle]) as {
            c: number;
        }[],
        sql('SELECT COUNT(*) as c FROM chats WHERE user_handle = $1', [event.locals.user.handle]) as { c: number }[],
        sql('SELECT COUNT(*) as c FROM messages m JOIN chats c ON c.id = m.chat_id WHERE c.user_handle = $1', [
            event.locals.user.handle,
        ]) as { c: number }[],
    ]);

    return jsonOk({
        characters: (charRows[0] as any)?.c || 0,
        chats: (chatRows[0] as any)?.c || 0,
        messages: (msgRows[0] as any)?.c || 0,
    });
};
