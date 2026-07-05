import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, saveWorldInfo } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, entries } = body;
    if (!name || !entries) return jsonError(400, 'name and entries are required');

    const db = getDb(event.platform!);
    const wi = await saveWorldInfo(db, {
        user_handle: event.locals.user.handle,
        name,
        entries: JSON.stringify(entries),
    });
    return jsonOk(wi);
};
