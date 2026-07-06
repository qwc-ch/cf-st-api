import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterById, updateCharacter } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, updates } = await event.request.json().catch(() => ({}));
    if (!id || !updates) return jsonError(400, 'id and updates are required');

    const char = await getCharacterById(id, event.locals.user.handle);
    if (!char) return jsonError(404, 'Character not found');

    const allowedFields: (keyof typeof char)[] = [
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
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            updateData[field] =
                typeof updates[field] === 'object' ? JSON.stringify(updates[field]) : String(updates[field]);
        }
    }

    if (Object.keys(updateData).length > 0) {
        await updateCharacter(id, event.locals.user.handle, updateData);
    }

    return jsonOk({ ok: true });
};
