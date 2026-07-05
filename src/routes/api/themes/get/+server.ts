import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getSettings } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    try {
        const db = getDb(event.platform!);
        const raw = await getSettings(db, event.locals.user.handle);
        let themes: Record<string, any> = {};
        if (raw) {
            try {
                const settings = JSON.parse(raw);
                if (settings.themes) themes = settings.themes;
            } catch {}
        }
        return jsonOk({ themes });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
