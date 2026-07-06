import { jsonError } from '../../../../lib/auth';
import { ensureUserExists, sql } from '../../../../lib/db';

function jsonOk(data: Record<string, unknown>): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key, id } = body;

    if (!key) return jsonError(400, 'key is required');

    try {
        await ensureUserExists(event.locals.user.handle);

        let deleteId = id;

        if (!deleteId) {
            const activeRows = await sql(
                'SELECT id FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1',
                [event.locals.user.handle, key],
            );
            const active = (activeRows as { id: string }[])[0];
            if (active) deleteId = active.id;
        }

        if (deleteId) {
            await sql('DELETE FROM secrets WHERE id = $1 AND user_handle = $2', [deleteId, event.locals.user.handle]);
        }

        const remaining = (await sql(
            'SELECT id, active FROM secrets WHERE user_handle = $1 AND key_name = $2 ORDER BY created ASC',
            [event.locals.user.handle, key],
        )) as { id: string; active: number }[];

        if (remaining.length > 0 && !remaining.some((r) => r.active === 1)) {
            await sql('UPDATE secrets SET active = 1 WHERE id = $1', [remaining[0].id]);
        }

        return jsonOk({ ok: true });
    } catch (err) {
        console.error('Failed to delete secret:', err);
        return jsonError(500, 'Failed to delete secret');
    }
};
