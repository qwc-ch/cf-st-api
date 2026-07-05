import { jsonError, jsonOk } from '../../../../lib/auth';
import { getChatById, getDb, getMessages } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    const db = getDb(event.platform!);
    const chat = await getChatById(db, id, event.locals.user.handle);
    if (!chat) return jsonError(404, 'Chat not found');

    const messages = await getMessages(db, id);
    return jsonOk({ chat, messages });
};

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const id = Number(event.url.searchParams.get('id'));
    if (!id) return jsonError(400, 'id is required');

    const db = getDb(event.platform!);
    const chat = await getChatById(db, id, event.locals.user.handle);
    if (!chat) return jsonError(404, 'Chat not found');

    const messages = await getMessages(db, id);
    return jsonOk({ chat, messages });
};
