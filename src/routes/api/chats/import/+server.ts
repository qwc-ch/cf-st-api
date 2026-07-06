import { jsonError, jsonOk } from '../../../../lib/auth';
import { createChat, getCharacterByAvatar, saveMessage } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const contentType = event.request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
        const formData = await event.request.formData();
        const file = (formData.get('chat') as File) || (formData.get('avatar') as File) || null;
        const avatarUrl = (formData.get('avatar_url') as string) || '';

        if (!file) return jsonError(400, 'No file uploaded');

        const text = await file.text();
        const messages: any[] = [];
        const lines = text.trim().split('\n');
        for (const line of lines) {
            try {
                messages.push(JSON.parse(line));
            } catch {}
        }

        if (messages.length === 0) return jsonError(400, 'No valid messages found');

        const header = messages[0];
        const chatMessages = messages.slice(1);
        const chatName = file.name.replace(/\.jsonl$/i, '') || 'Imported Chat';

        let charId: number | null = null;
        if (avatarUrl) {
            const char = await getCharacterByAvatar(event.locals.user.handle, avatarUrl);
            if (char) charId = char.id;
        }

        if (!charId) return jsonError(400, 'avatar_url is required');

        const chat = await createChat({
            user_handle: event.locals.user.handle,
            character_id: charId,
            name: chatName,
        });

        for (let i = 0; i < chatMessages.length; i++) {
            const msg = chatMessages[i];
            await saveMessage({
                chat_id: chat.id,
                role: msg.role || 'user',
                name: msg.name || '',
                content: msg.content || '',
                extra: msg.extra ? (typeof msg.extra === 'string' ? msg.extra : JSON.stringify(msg.extra)) : null,
                message_id: msg.message_id ?? i,
            });
        }

        return jsonOk({ res: true, fileNames: [chatName] });
    }

    const { character_id, name, messages } = await event.request.json().catch(() => ({}));
    if (!character_id || !Array.isArray(messages)) return jsonError(400, 'character_id and messages are required');

    const chat = await createChat({
        user_handle: event.locals.user.handle,
        character_id,
        name: name || 'Imported Chat',
    });

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

    return jsonOk(chat);
};
