import { jsonError, jsonOk } from '../../../../lib/auth';
import { getSettings, saveSettings } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name } = body;
    if (!name) return jsonError(400, 'Missing name');

    try {
        const raw = await getSettings(event.locals.user.handle);
        let settings: Record<string, any> = {};
        if (raw) {
            try {
                settings = JSON.parse(raw);
            } catch {}
        }
        if (settings.themes) {
            delete settings.themes[name];
        }
        await saveSettings(event.locals.user.handle, JSON.stringify(settings));
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
