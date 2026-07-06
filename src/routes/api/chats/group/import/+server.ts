import { jsonError, jsonOk } from '../../../../../lib/auth';
import { sql } from '../../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const contentType = event.request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
        const formData = await event.request.formData();
        const file = (formData.get('chat') as File) || (formData.get('avatar') as File) || null;
        const groupId = (formData.get('group_id') as string) || '';

        if (!file || !groupId) return jsonError(400, 'File and group_id are required');

        const rows = await sql('SELECT * FROM chat_groups WHERE user_handle = $1 AND (name = $2 OR id = $3)', [
            event.locals.user.handle,
            groupId,
            parseInt(groupId, 10) || 0,
        ]);
        const group = (rows as any[])[0];
        if (!group) return jsonError(404, 'Group not found');

        const text = await file.text();
        const lines = text.trim().split('\n');
        const messages: any[] = [];
        for (const line of lines) {
            try {
                messages.push(JSON.parse(line));
            } catch {}
        }

        const header = messages[0]?.chat_metadata ? messages[0] : null;
        const chatMessages = header ? messages.slice(1) : messages;

        let existingData: Record<string, any> = {};
        try {
            existingData = JSON.parse(group.data || '{}');
        } catch {}

        existingData.chat = {
            messages: chatMessages,
            chat_metadata: header?.chat_metadata || {},
        };

        await sql('UPDATE chat_groups SET data = $1, updated = $2 WHERE id = $3 AND user_handle = $4', [
            JSON.stringify(existingData),
            Date.now(),
            group.id,
            event.locals.user.handle,
        ]);

        return jsonOk({ res: true });
    }

    const { id, data: chatData } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    const rows = await sql('SELECT * FROM chat_groups WHERE user_handle = $1 AND (name = $2 OR id = $3)', [
        event.locals.user.handle,
        id,
        parseInt(id, 10) || 0,
    ]);
    const group = (rows as any[])[0];
    if (!group) return jsonError(404, 'Group not found');

    let existingData: Record<string, any> = {};
    try {
        existingData = JSON.parse(group.data || '{}');
    } catch {}
    existingData = { ...existingData, chat: chatData || {} };

    await sql('UPDATE chat_groups SET data = $1, updated = $2 WHERE id = $3 AND user_handle = $4', [
        JSON.stringify(existingData),
        Date.now(),
        group.id,
        event.locals.user.handle,
    ]);

    return jsonOk({ ok: true });
};
