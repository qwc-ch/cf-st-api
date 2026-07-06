import { jsonError, jsonOk } from '../../../../lib/auth';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { value } = await event.request.json().catch(() => ({}));
    if (!value) return jsonError(400, 'value is required');

    await db
        .prepare(
            'INSERT INTO settings (user_handle, value) VALUES (?, ?) ON CONFLICT(user_handle) DO UPDATE SET value = excluded.value',
        )
        .bind(event.locals.user.handle, typeof value === 'string' ? value : JSON.stringify(value))
        .run();

    return jsonOk({ ok: true });
};
