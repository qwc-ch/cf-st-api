import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getSettings } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    try {
        const db = getDb(event.platform!);
        const raw = await getSettings(db, event.locals.user.handle);
        let quickReplies: Record<string, any> = {};
        if (raw) {
            try {
                const settings = JSON.parse(raw);
                if (settings.quick_replies) quickReplies = settings.quick_replies;
            } catch {}
        }
        return jsonOk({ quick_replies: quickReplies });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
