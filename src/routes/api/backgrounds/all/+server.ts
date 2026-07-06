import { jsonOk } from '../../../../lib/auth';

const handle = async (event) => {
    if (!event.locals.user)
        return new Response(JSON.stringify({ images: [], config: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    const rows = await db
        .prepare('SELECT * FROM backgrounds WHERE user_handle = ? ORDER BY created DESC')
        .bind(event.locals.user.handle)
        .all()
        .then((r) => r.results);
    const images = rows.map((r) => ({ filename: r.name, path: r.path }));
    return jsonOk({ images, config: {} });
};

export const POST = handle;
export const GET = handle;
