import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterByAvatar, getCharacterById } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id, avatar_url, format } = await event.request.json().catch(() => ({}));

    let char = null;
    if (id) {
        char = await getCharacterById(id, event.locals.user.handle);
    } else if (avatar_url) {
        char = await getCharacterByAvatar(event.locals.user.handle, avatar_url);
    }
    if (!char) return jsonError(404, 'Character not found');

    const exportFormat = format || 'json';
    const exportData = {
        name: char.name,
        description: char.description,
        personality: char.personality,
        scenario: char.scenario,
        first_mes: char.first_mes,
        mes_example: char.mes_example,
        creator_notes: char.creator_notes,
        system_prompt: char.system_prompt,
        post_history_instructions: char.post_history_instructions,
        tags: (() => {
            try {
                return JSON.parse(char.tags);
            } catch {
                return [];
            }
        })(),
        creator: char.creator,
        character_version: char.character_version,
        extensions: (() => {
            try {
                return JSON.parse(char.extensions);
            } catch {
                return {};
            }
        })(),
        data: (() => {
            try {
                return JSON.parse(char.data);
            } catch {
                return {};
            }
        })(),
        spec: char.spec || 'chara_card_v2',
        spec_version: char.spec_version || '2.0',
    };

    if (exportFormat === 'png') {
        return new Response(JSON.stringify(exportData), {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="${char.name}.png"`,
            },
        });
    }

    return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${char.name}.json"`,
        },
    });
};
