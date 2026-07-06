import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getChatById, getChatByName, getMessages } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, ch_name, file_name, avatar_url } = await event.request.json().catch(() => ({}));

    let chatId = id;
    let characterName = ch_name || '';

    if (!chatId && file_name && avatar_url) {
        const char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
        if (!char) return jsonError(404, 'Character not found');
        const chatName = file_name.replace(/\.jsonl$/i, '');
        characterName = characterName || char.name;
        const chat = await getChatByName(event.locals.user.handle, char.id, chatName);
        if (chat) chatId = chat.id;
    }

    if (!chatId) return jsonError(404, 'Chat not found');

    const messages = await getMessages(chatId);
    const header = { chat_metadata: {}, user_name: '', character_name: characterName };
    const result = messages.map((m, i) => ({
        ...m,
        extra: m.extra
            ? (() => {
                  try {
                      return JSON.parse(m.extra);
                  } catch {
                      return {};
                  }
              })()
            : undefined,
        message_id: m.message_id ?? i,
    }));
    return jsonOk([header, ...result]);
};

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const id = Number(event.url.searchParams.get('id'));
    if (!id) return jsonError(400, 'id is required');

    const chat = await getChatById(id, event.locals.user.handle);
    if (!chat) return jsonError(404, 'Chat not found');

    const messages = await getMessages(id);
    const header = { chat_metadata: {}, user_name: '', character_name: chat.name };
    const result = messages.map((m) => ({
        ...m,
        extra: m.extra
            ? (() => {
                  try {
                      return JSON.parse(m.extra);
                  } catch {
                      return {};
                  }
              })()
            : undefined,
    }));
    return jsonOk([header, ...result]);
};
