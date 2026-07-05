import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getSettings, saveSettings } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, content } = body;
    if (!name || !content) return jsonError(400, 'Missing name or content');

    try {
        const db = getDb(event.platform!);
        const raw = await getSettings(db, event.locals.user.handle);
        let settings: Record<string, any> = {};
        if (raw) {
            try {
                settings = JSON.parse(raw);
            } catch {}
        }
        const themes = settings.themes || {};
        themes[name] = content;
        settings.themes = themes;
        await saveSettings(db, event.locals.user.handle, JSON.stringify(settings));
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
