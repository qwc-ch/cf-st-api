import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getSettings, saveSettings } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    if (!body || typeof body !== 'object') return jsonError(400, 'Invalid settings');

    const db = getDb(event.platform!);

    let existing: Record<string, any> = {};
    const raw = await getSettings(db, event.locals.user.handle);
    if (raw) {
        try {
            existing = JSON.parse(raw);
        } catch {}
    }

    const merged = { ...existing, ...body };
    await saveSettings(db, event.locals.user.handle, JSON.stringify(merged));
    return jsonOk({ ok: true });
};
