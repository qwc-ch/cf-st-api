import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getChatByName, getMessages } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, avatar_url, file: chatFileName, exportfilename, format } = await event.request.json().catch(() => ({}));

    let chat = null;
    if (id) {
        const { getChatById } = await import('../../../../lib/db');
        chat = await getChatById(id, event.locals.user.handle);
    } else if (chatFileName && avatar_url) {
        const char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
        if (!char) return jsonError(404, 'Character not found');
        const chatName = chatFileName.replace(/\.jsonl$/i, '');
        chat = await getChatByName(event.locals.user.handle, char.id, chatName);
    }

    if (!chat) return jsonError(404, 'Chat not found');

    const messages = await getMessages(chat.id);
    const exportFormat = format || 'jsonl';

    if (exportFormat === 'txt') {
        const text = messages.map((m) => `${m.name}: ${m.content}`).join('\n\n');
        return new Response(JSON.stringify({ result: text, message: 'Chat exported as text' }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const jsonl = messages
        .map((m) =>
            JSON.stringify({
                role: m.role,
                name: m.name,
                content: m.content,
                extra: m.extra
                    ? (() => {
                          try {
                              return JSON.parse(m.extra);
                          } catch {
                              return {};
                          }
                      })()
                    : undefined,
            }),
        )
        .join('\n');

    if (exportFormat === 'jsonl') {
        return new Response(JSON.stringify({ result: jsonl, message: 'Chat exported as JSONL' }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return jsonOk({ result: jsonl, message: `Chat exported as ${exportFormat}` });
};
