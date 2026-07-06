import { jsonError, jsonOk } from '../../../../lib/auth';
import { getSecrets, sql } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { key } = body;

    if (key) {
        const secrets = (await sql(
            'SELECT id, key_name, value, label, active, created FROM secrets WHERE user_handle = $1 AND key_name = $2 ORDER BY created DESC',
            [event.locals.user.handle, key],
        )) as { id: string; key_name: string; value: string; label: string; active: number; created: number }[];

        const masked = secrets.map((s) => ({
            ...s,
            value: s.value.length > 3 ? '******' + s.value.slice(-3) : '******',
        }));

        return jsonOk({ secrets: masked });
    }

    const allSecrets = await getSecrets(event.locals.user.handle);
    const flatMap: Record<string, string> = {};
    for (const s of allSecrets) {
        const maskedValue = s.value.length > 3 ? '******' + s.value.slice(-3) : '******';
        flatMap[s.key_name] = maskedValue;
    }
    return jsonOk(flatMap);
};
