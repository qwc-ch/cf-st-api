import { jsonError } from '../../../../lib/auth';
import { ensureUserExists, getSettings, saveSettings } from '../../../../lib/db';

function jsonOk(data: Record<string, unknown>): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    if (!body || typeof body !== 'object') return jsonError(400, 'Invalid settings');

    try {
        await ensureUserExists(event.locals.user.handle);

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
    } catch (err) {
        console.error('Failed to save settings:', err);
        return jsonError(500, 'Failed to save settings');
    }
};
