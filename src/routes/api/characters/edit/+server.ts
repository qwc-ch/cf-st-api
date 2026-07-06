import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getCharacterById, updateCharacter } from '../../../../lib/db';
import { uploadImage } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const contentType = event.request.headers.get('content-type') || '';

    let body: Record<string, any> = {};
    let avatarFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
        const formData = await event.request.formData();
        for (const [key, value] of formData.entries()) {
            if (value instanceof File && value.size > 0) {
                avatarFile = value;
            } else {
                body[key] = value;
            }
        }
    } else {
        body = await event.request.json().catch(() => ({}));
    }

    let char = null;
    if (body.id) {
        char = await getCharacterById(Number(body.id), event.locals.user.handle);
    } else if (body.avatar_url) {
        char = await getCharacterByAvatar(event.locals.user.handle, body.avatar_url);
    }
    if (!char) return jsonError(404, 'Character not found');

    if (avatarFile) {
        const filename = `${body.name || char.name}.png`;
        const buffer = await avatarFile.arrayBuffer();
        await uploadImage(event.locals.user.handle, 'avatar', filename, buffer, avatarFile.type);
        body.avatar_url = filename;
    }

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
        'spec_version',
        'spec',
    ];

    const updateData: Record<string, string> = {};
    for (const field of allowed) {
        if (body[field] !== undefined) {
            let value = body[field];
            if (field === 'extensions' || field === 'tags' || field === 'data') {
                if (typeof value === 'object') value = JSON.stringify(value);
            }
            updateData[field] = String(value);
        }
    }

    if (body.talkativeness || body.depth_prompt_prompt || body.character_world || body.alternate_greetings) {
        const existingData = (() => {
            try {
                return JSON.parse(char.data || '{}');
            } catch {
                return {};
            }
        })();
        if (body.talkativeness) existingData.talkativeness = body.talkativeness;
        if (body.depth_prompt_prompt) existingData.depth_prompt_prompt = body.depth_prompt_prompt;
        if (body.depth_prompt_depth) existingData.depth_prompt_depth = body.depth_prompt_depth;
        if (body.depth_prompt_role) existingData.depth_prompt_role = body.depth_prompt_role;
        if (body.character_world) existingData.character_world = body.character_world;
        if (body.alternate_greetings) {
            const ag = Array.isArray(body.alternate_greetings) ? body.alternate_greetings : [body.alternate_greetings];
            existingData.alternate_greetings = ag;
        }
        updateData.data = JSON.stringify(existingData);
    }

    if (Object.keys(updateData).length > 0) {
        await updateCharacter(char.id, event.locals.user.handle, updateData);
    }

    const updated = await getCharacterById(char.id, event.locals.user.handle);
    return jsonOk(updated);
};
