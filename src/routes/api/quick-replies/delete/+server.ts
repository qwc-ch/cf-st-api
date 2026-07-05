import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getSettings, saveSettings } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name } = body;
    if (!name) return jsonError(400, 'Missing name');

    try {
        const db = getDb(event.platform!);
        const raw = await getSettings(db, event.locals.user.handle);
        let settings: Record<string, any> = {};
        if (raw) {
            try {
                settings = JSON.parse(raw);
            } catch {}
        }
        if (settings.quick_replies) {
            delete settings.quick_replies[name];
        }
        await saveSettings(db, event.locals.user.handle, JSON.stringify(settings));
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
