import { jsonError, jsonOk } from '../../../../lib/auth';
import { getSettings } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    try {
        const raw = await getSettings(event.locals.user.handle);
        let state: any = {};
        if (raw) {
            try {
                const settings = JSON.parse(raw);
                if (settings.moving_ui) state = settings.moving_ui;
            } catch {}
        }
        return jsonOk({ state });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
