import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterById, getDb, updateCharacter } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { id } = body;
    if (!id) return jsonError(400, 'id is required');

    const db = getDb(event.platform!);
    const char = await getCharacterById(db, id, event.locals.user.handle);
    if (!char) return jsonError(404, 'Character not found');

    const allowed = [
        'avatar_url',
        'name',
        'description',
        'personality',
        'scenario',
        'first_mes',
        'mes_example',
        'creator_notes',
        'system_prompt',
        'post_history_instructions',
        'tags',
        'creator',
        'character_version',
        'extensions',
        'data',
        'spec_version',
        'spec',
    ];

    const updateData: Record<string, string> = {};
    for (const field of allowed) {
        if (body[field] !== undefined) {
            updateData[field] = typeof body[field] === 'object' ? JSON.stringify(body[field]) : String(body[field]);
        }
    }

    if (Object.keys(updateData).length > 0) {
        await updateCharacter(db, id, event.locals.user.handle, updateData);
    }

    const updated = await getCharacterById(db, id, event.locals.user.handle);
    return jsonOk(updated);
};
