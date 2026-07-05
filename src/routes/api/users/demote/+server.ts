import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, setUserAdmin } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user?.admin) return jsonError(403, 'Admin required');
    const { handle } = await event.request.json().catch(() => ({}));
    if (!handle) return jsonError(400, 'handle is required');

    const db = getDb(event.platform!);
    await setUserAdmin(db, handle, 0);
    return jsonOk({ ok: true });
};
