import { jsonError } from '../../../../lib/auth';
import { createCharacter, getCharacterByAvatar } from '../../../../lib/db';
import { uploadImage } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const formData = await event.request.formData();
    const file = formData.get('avatar') as File | null;
    const fileType = (formData.get('file_type') as string) || 'json';
    const preservedName = formData.get('preserved_name') as string | null;

    if (!file) return jsonError(400, 'No file uploaded');

    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);

    let charData: Record<string, any> = {};

    if (fileType === 'json' || fileType === 'charx') {
        try {
            charData = JSON.parse(text);
        } catch {
            return jsonError(400, 'Invalid JSON file');
        }
    } else {
        return jsonError(400, `Unsupported format: ${fileType}`);
    }

    if (!charData.name) return jsonError(400, 'Character name not found in file');

    const fileName = preservedName || `${charData.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;

    const existing = preservedName ? await getCharacterByAvatar(event.locals.user.handle, preservedName) : null;
    if (existing) {
        return new Response(JSON.stringify({ file_name: preservedName }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const char = await createCharacter({
        user_handle: event.locals.user.handle,
        avatar_url: fileName,
        name: charData.name || '',
        description: charData.description || '',
        personality: charData.personality || '',
        scenario: charData.scenario || '',
        first_mes: charData.first_mes || '',
        mes_example: charData.mes_example || '',
        creator_notes: charData.creator_notes || '',
        system_prompt: charData.system_prompt || '',
        post_history_instructions: charData.post_history_instructions || '',
        tags: JSON.stringify(charData.tags || []),
        creator: charData.creator || '',
        character_version: charData.character_version || '1.0',
        extensions: JSON.stringify(charData.extensions || {}),
        data: JSON.stringify(charData.data || {}),
        spec_version: charData.spec_version || '',
        spec: charData.spec || '',
    });

    return new Response(JSON.stringify({ file_name: fileName }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
