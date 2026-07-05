import { jsonError, jsonOk } from '../../../../lib/auth';
import { createCharacter, getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    if (!body || !body.name) return jsonError(400, 'Invalid character data');

    const db = getDb(event.platform!);
    const char = await createCharacter(db, {
        user_handle: event.locals.user.handle,
        avatar_url: null,
        name: body.name,
        description: body.description || '',
        personality: body.personality || '',
        scenario: body.scenario || '',
        first_mes: body.first_mes || '',
        mes_example: body.mes_example || '',
        creator_notes: body.creator_notes || '',
        system_prompt: body.system_prompt || '',
        post_history_instructions: body.post_history_instructions || '',
        tags: JSON.stringify(body.tags || []),
        creator: body.creator || '',
        character_version: body.character_version || '1.0',
        extensions: JSON.stringify(body.extensions || {}),
        data: JSON.stringify(body.data || {}),
        spec_version: body.spec || '',
        spec: body.spec || '',
    });
    return jsonOk(char);
};
