import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key } = body;

    if (!key) return jsonError(400, 'key is required');

    const db = getDb(event.platform!);

    const secrets = await db
        .prepare(
            'SELECT id, key_name, value, label, active, created FROM secrets WHERE user_handle = ? AND key_name = ? ORDER BY created DESC',
        )
        .bind(event.locals.user.handle, key)
        .all<{ id: string; key_name: string; value: string; label: string; active: number; created: number }>()
        .then((r) => r.results);

    const masked = secrets.map((s) => ({
        ...s,
        value: s.value.length > 3 ? '******' + s.value.slice(-3) : '******',
    }));

    return jsonOk({ secrets: masked });
};
