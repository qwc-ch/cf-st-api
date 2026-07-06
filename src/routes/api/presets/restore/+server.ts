import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { name, apiId } = await event.request.json().catch(() => ({}));
    if (!name) return jsonError(400, 'name is required');

    const rows = await sql('SELECT * FROM presets WHERE user_handle = $1 AND name = $2', [
        event.locals.user.handle,
        name,
    ]);

    const presets = rows as any[];
    if (presets.length === 0) return jsonError(404, 'Preset not found');

    let preset = presets[0];
    if (apiId) {
        const match = presets.find((p: any) => p.api_id === apiId);
        if (match) preset = match;
    }

    let value = {};
    try {
        value = JSON.parse(preset.value || '{}');
    } catch {}

    return jsonOk(value);
};
