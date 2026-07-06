import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getChatByName, updateChatName } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, name, avatar_url, original_file, renamed_file } = await event.request.json().catch(() => ({}));

    if (id && name) {
        await updateChatName(id, event.locals.user.handle, name);
        return jsonOk({ ok: true });
    }

    if (!avatar_url || !original_file || !renamed_file) {
        return jsonError(400, 'avatar_url, original_file, and renamed_file are required');
    }

    const char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
    if (!char) return jsonError(404, 'Character not found');

    const oldName = original_file.replace(/\.jsonl$/i, '');
    const newName = renamed_file.replace(/\.jsonl$/i, '');

    const chat = await getChatByName(event.locals.user.handle, char.id, oldName);
    if (!chat) return jsonError(404, 'Chat not found');

    await updateChatName(chat.id, event.locals.user.handle, newName);
    return jsonOk({ sanitizedFileName: newName, ok: true });
};
