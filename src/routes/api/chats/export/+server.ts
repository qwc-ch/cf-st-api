import { jsonError } from '../../../../lib/auth';
import { getChatById, getDb, getMessages } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    const db = getDb(event.platform!);
    const chat = await getChatById(db, id, event.locals.user.handle);
    if (!chat) return jsonError(404, 'Chat not found');

    const messages = await getMessages(db, id);
    const jsonl = messages
        .map((m) =>
            JSON.stringify({
                role: m.role,
                name: m.name,
                content: m.content,
                extra: m.extra ? JSON.parse(m.extra) : undefined,
            }),
        )
        .join('\n');

    return new Response(jsonl, {
        headers: {
            'Content-Type': 'application/jsonl',
            'Content-Disposition': `attachment; filename="chat-${chat.name}.jsonl"`,
        },
    });
};
