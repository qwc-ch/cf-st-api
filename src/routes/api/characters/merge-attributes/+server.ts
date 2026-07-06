import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getCharacterById, updateCharacter } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, avatar, avatar_url, updates, chat, data } = await event.request.json().catch(() => ({}));

    const avatarKey = avatar || avatar_url;
    let char = null;
    if (id) {
        char = await getCharacterById(id, event.locals.user.handle);
    } else if (avatarKey) {
        char = await getCharacterByAvatar(event.locals.user.handle, avatarKey);
    }
    if (!char) return jsonError(404, 'Character not found');

    const updateData: Record<string, any> = {};

    if (updates) {
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
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateData[field] =
                    typeof updates[field] === 'object' ? JSON.stringify(updates[field]) : String(updates[field]);
            }
        }
    }

    if (chat) {
        const existingData = (() => {
            try {
                return JSON.parse(char.data || '{}');
            } catch {
                return {};
            }
        })();
        existingData.chat = String(chat);
        updateData.data = JSON.stringify(existingData);
    }

    if (data) {
        const existingData = (() => {
            try {
                return JSON.parse(updateData.data || char.data || '{}');
            } catch {
                return {};
            }
        })();
        const mergedData = { ...existingData, ...data };
        updateData.data = JSON.stringify(mergedData);
    }

    if (Object.keys(updateData).length > 0) {
        await updateCharacter(char.id, event.locals.user.handle, updateData);
    }

    return jsonOk({ ok: true });
};
