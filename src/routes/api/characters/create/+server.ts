import { jsonError, jsonOk } from '../../../../lib/auth';
import { createCharacter } from '../../../../lib/db';
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

    const name = body.name;
    if (!name) return jsonError(400, 'name is required');

    let avatarUrl = body.avatar_url || null;

    if (avatarFile) {
        const filename = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
        const buffer = await avatarFile.arrayBuffer();
        await uploadImage(event.locals.user.handle, 'avatar', filename, buffer, avatarFile.type);
        avatarUrl = filename;
    }

    let extensions = {};
    try {
        extensions = JSON.parse(body.extensions || '{}');
    } catch {}

    let alternateGreetings: string[] = [];
    const ag = body.alternate_greetings;
    if (Array.isArray(ag)) alternateGreetings = ag;
    else if (typeof ag === 'string') alternateGreetings = [ag];

    const characterData: Record<string, any> = {};
    if (alternateGreetings.length > 0) characterData.alternate_greetings = alternateGreetings;
    if (body.character_world) characterData.character_world = body.character_world;
    if (body.depth_prompt_prompt) characterData.depth_prompt_prompt = body.depth_prompt_prompt;
    if (body.depth_prompt_depth) characterData.depth_prompt_depth = body.depth_prompt_depth;
    if (body.depth_prompt_role) characterData.depth_prompt_role = body.depth_prompt_role;
    if (body.talkativeness) characterData.talkativeness = body.talkativeness;

    const char = await createCharacter({
        user_handle: event.locals.user.handle,
        avatar_url: avatarUrl,
        name,
        description: body.description || '',
        personality: body.personality || '',
        scenario: body.scenario || '',
        first_mes: body.first_mes || '',
        mes_example: body.mes_example || '',
        creator_notes: body.creator_notes || '',
        system_prompt: body.system_prompt || '',
        post_history_instructions: body.post_history_instructions || '',
        tags: body.tags || '[]',
        creator: body.creator || '',
        character_version: body.character_version || '1.0',
        extensions: JSON.stringify(extensions),
        data: JSON.stringify(characterData),
        spec_version: body.spec_version || '',
        spec: body.spec || '',
    });

    return new Response(avatarUrl || `${name}.png`, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
    });
};
