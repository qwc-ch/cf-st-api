import { jsonError, jsonOk } from '../../../../lib/auth';
import { getSettings, saveSettings } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, content, icon } = body;
    if (!name || !content) return jsonError(400, 'Missing name or content');

    try {
        const raw = await getSettings(event.locals.user.handle);
        let settings: Record<string, any> = {};
        if (raw) {
            try {
                settings = JSON.parse(raw);
            } catch {}
        }
        const quickReplies = settings.quick_replies || {};
        quickReplies[name] = { content, icon: icon || '' };
        settings.quick_replies = quickReplies;
        await saveSettings(event.locals.user.handle, JSON.stringify(settings));
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
