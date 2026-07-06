import { jsonError } from '../../../../lib/auth';
import { ensureUserExists, sql } from '../../../../lib/db';

function jsonOk(data: unknown): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id } = body;

    try {
        await ensureUserExists(event.locals.user.handle);

        if (key) {
            let found;
            if (id) {
                const rows = await sql(
                    'SELECT value FROM secrets WHERE id = $1 AND user_handle = $2 AND key_name = $3',
                    [id, event.locals.user.handle, key],
                );
                found = (rows as { value: string }[])[0];
            } else {
                const rows = await sql(
                    'SELECT value FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1',
                    [event.locals.user.handle, key],
                );
                found = (rows as { value: string }[])[0];
            }
            return jsonOk({ value: found?.value || '' });
        }

        const rows = await sql(
            'SELECT id, key_name, active, created FROM secrets WHERE user_handle = $1 ORDER BY created',
            [event.locals.user.handle],
        );

        const grouped: Record<string, unknown[]> = {};
        for (const row of rows as Array<{ id: string; key_name: string; active: number; created: number }>) {
            if (!grouped[row.key_name]) grouped[row.key_name] = [];
            grouped[row.key_name].push(row);
        }

        return jsonOk(grouped);
    } catch (err) {
        console.error('Failed to read secrets:', err);
        return jsonError(500, 'Failed to read secrets');
    }
};
