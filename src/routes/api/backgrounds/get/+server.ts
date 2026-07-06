import { jsonError, jsonOk } from '../../../../lib/auth';
import { ensureUserExists, sql } from '../../../../lib/db';
export const GET = async (event) => {
    try {
        if (!event.locals.user) return jsonError(401, 'Unauthorized');
        await ensureUserExists(event.locals.user.handle);
        const backgrounds = await sql('SELECT * FROM backgrounds WHERE user_handle = $1 ORDER BY created DESC', [
            event.locals.user.handle,
        ]);
        return jsonOk(backgrounds);
    } catch (e) {
        console.error('Failed to get backgrounds:', e);
        return jsonError(500, 'Failed to get backgrounds');
    }
};

export const POST = async (event) => {
    try {
        if (!event.locals.user) return jsonError(401, 'Unauthorized');
        await ensureUserExists(event.locals.user.handle);
        const backgrounds = await sql('SELECT * FROM backgrounds WHERE user_handle = $1 ORDER BY created DESC', [
            event.locals.user.handle,
        ]);
        return jsonOk(backgrounds);
    } catch (e) {
        console.error('Failed to get backgrounds:', e);
        return jsonError(500, 'Failed to get backgrounds');
    }
};
