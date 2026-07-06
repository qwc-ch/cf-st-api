import { jsonError, jsonOk } from '../../../../lib/auth';
import { getSettings, saveSettings } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { state } = body;
    if (!state) return jsonError(400, 'Missing state');

    try {
        const raw = await getSettings(event.locals.user.handle);
        let settings: Record<string, any> = {};
        if (raw) {
            try {
                settings = JSON.parse(raw);
            } catch {}
        }
        settings.moving_ui = state;
        await saveSettings(event.locals.user.handle, JSON.stringify(settings));
        return jsonOk({ ok: true });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
