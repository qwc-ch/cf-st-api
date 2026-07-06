import { jsonError } from '../../../../lib/auth';
import { ensureUserExists, getSettings } from '../../../../lib/db';

function jsonOk(data: Record<string, unknown>): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

async function getSettingsData(userHandle: string) {
    const settings = await getSettings(userHandle);
    if (settings) {
        try {
            return JSON.parse(settings);
        } catch {
            return null;
        }
    }
    return null;
}

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    await ensureUserExists(event.locals.user.handle);

    const parsed = await getSettingsData(event.locals.user.handle);
    if (parsed) {
        return jsonOk({
            result: 'ok',
            settings: JSON.stringify(parsed),
            enable_accounts: false,
            request_compression: { enabled: false },
        });
    }

    return jsonOk({ result: 'file not find' });
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    await ensureUserExists(event.locals.user.handle);

    const parsed = await getSettingsData(event.locals.user.handle);
    if (parsed) {
        return jsonOk({
            result: 'ok',
            settings: JSON.stringify(parsed),
            enable_accounts: false,
            request_compression: { enabled: false },
        });
    }

    return jsonOk({ result: 'file not find' });
};
