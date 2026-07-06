import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

const handle = async (event) => {
    try {
        if (!event.locals.user) return jsonOk({ images: [], config: {} });
        const rows = (await sql('SELECT * FROM backgrounds WHERE user_handle = $1 ORDER BY created DESC', [
            event.locals.user.handle,
        ])) as { name: string; path: string }[];
        const images = rows.map((r) => ({ filename: r.name, path: r.path }));
        return jsonOk({ images, config: {} });
    } catch (e) {
        console.error('Failed to get backgrounds:', e);
        return jsonError(500, 'Failed to get backgrounds');
    }
};

export const POST = handle;
export const GET = handle;
