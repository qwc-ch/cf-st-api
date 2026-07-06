import { jsonError, jsonOk } from '../../../../lib/auth';
import { getSettings, saveSettings } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    if (!body || typeof body !== 'object') return jsonError(400, 'Invalid settings');

    let existing: Record<string, any> = {};
    const raw = await getSettings(event.locals.user.handle);
    if (raw) {
        try {
            existing = JSON.parse(raw);
        } catch {}
    }

    const merged = { ...existing, ...body };
    await saveSettings(event.locals.user.handle, JSON.stringify(merged));
    return jsonOk({ ok: true });
};
