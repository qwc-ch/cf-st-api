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

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const api_key = event.url.searchParams.get('api_key');
    if (!api_key) return jsonError(400, 'api_key query param is required');

    try {
        const res = await fetch(`${HORDE_API}/find_user`, {
            headers: { apikey: api_key },
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const apiKey = await getHordeApiKey(event.locals.user.handle);

    try {
        const headers: Record<string, string> = {};
        if (apiKey) headers['apikey'] = apiKey;
        const res = await fetch(`${HORDE_API}/find_user`, { headers });
        if (!res.ok) return jsonError(res.status, await res.text());
        const data = await res.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
