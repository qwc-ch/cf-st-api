import { jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

const handle = async (event) => {
    if (!event.locals.user)
        return new Response(JSON.stringify({ images: [], config: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    const rows = (await sql('SELECT * FROM backgrounds WHERE user_handle = $1 ORDER BY created DESC', [
        event.locals.user.handle,
    ])) as { name: string; path: string }[];
    const images = rows.map((r) => ({ filename: r.name, path: r.path }));
    return jsonOk({ images, config: {} });
};

export const POST = handle;
export const GET = handle;
