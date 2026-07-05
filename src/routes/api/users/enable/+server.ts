import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb, setUserEnabled } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user?.admin) return jsonError(403, 'Admin required');
    const { handle } = await event.request.json().catch(() => ({}));
    if (!handle) return jsonError(400, 'handle is required');

    const db = getDb(event.platform!);
    await setUserEnabled(db, handle, 1);
    return jsonOk({ ok: true });
};
