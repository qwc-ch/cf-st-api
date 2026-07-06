import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

const HORDE_API = 'https://horde.koboldai.net/api/v2';

async function getHordeApiKey(userHandle: string): Promise<string | null> {
    const rows = await sql(
        'SELECT value FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1 LIMIT 1',
        [userHandle, 'api_key_horde'],
    );
    return (rows as { value: string }[])[0]?.value ?? null;
}

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const apiKey = await getHordeApiKey(event.locals.user.handle);

    const body = await event.request.json().catch(() => ({}));
    const { prompt, params, trusted_workers, models } = body;
    if (!prompt) return jsonError(400, 'prompt is required');

    try {
        const res = await fetch(`${HORDE_API}/generate/text/async`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { apikey: apiKey } : {}),
            },
            body: JSON.stringify({ prompt, params, trusted_workers, models }),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
