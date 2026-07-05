import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, getSettings } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const db = getDb(event.platform!);
    const settings = await getSettings(db, event.locals.user.handle);

    if (settings) {
        try {
            return jsonOk(JSON.parse(settings));
        } catch {
            return jsonOk({});
        }
    }

    return jsonOk({});
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const db = getDb(event.platform!);
    const settings = await getSettings(db, event.locals.user.handle);

    if (settings) {
        try {
            return jsonOk(JSON.parse(settings));
        } catch {
            return jsonOk({});
        }
    }

    return jsonOk({});
};
