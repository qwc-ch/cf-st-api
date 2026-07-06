import { jsonError } from '../../../../../lib/auth';
import { sql } from '../../../../../lib/db';

const CHAT_SOURCE_TO_SECRET_KEY: Record<string, string> = {
    openai: 'api_key_openai',
    openrouter: 'api_key_openrouter',
    custom: 'api_key_custom',
    ai21: 'api_key_ai21',
    cohere: 'api_key_cohere',
    perplexity: 'api_key_perplexity',
    groq: 'api_key_groq',
    deepseek: 'api_key_deepseek',
    xai: 'api_key_xai',
    aimlapi: 'api_key_aimlapi',
    mistralai: 'api_key_mistralai',
    nanogpt: 'api_key_nanogpt',
    chutes: 'api_key_chutes',
    electronhub: 'api_key_electronhub',
    moonshot: 'api_key_moonshot',
    fireworks: 'api_key_fireworks',
    claude: 'api_key_claude',
    makersuite: 'api_key_makersuite',
};

async function getSecretKey(userHandle: string, keyName: string): Promise<string | null> {
    const rows = await sql(
        'SELECT value FROM secrets WHERE user_handle = $1 AND key_name = $2 AND active = 1 LIMIT 1',
        [userHandle, keyName],
    );
    return (rows as { value: string }[])[0]?.value ?? null;
}

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const body = await event.request.json().catch(() => ({}));
    const api_url = body.api_url || body.custom_url;
    const {
        api_url: _,
        custom_url,
        api_key,
        custom_include_headers,
        custom_exclude_body,
        custom_include_body,
        chat_completion_source,
        ...params
    } = body;

    if (!api_url) return jsonError(400, 'api_url is required');

    // Resolve API key: prefer body.api_key, fall back to DB secret
    let resolvedKey = api_key;
    if (!resolvedKey && chat_completion_source) {
        const secretKeyName = CHAT_SOURCE_TO_SECRET_KEY[chat_completion_source];
        if (secretKeyName) {
            resolvedKey = await getSecretKey(event.locals.user.handle, secretKeyName);
        }
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (resolvedKey) headers['Authorization'] = `Bearer ${resolvedKey}`;

    if (custom_include_headers && typeof custom_include_headers === 'object') {
        for (const [k, v] of Object.entries(custom_include_headers as Record<string, string>)) {
            headers[k] = v;
        }
    }

    try {
        const upstream = await fetch(api_url, {
            method: 'POST',
            headers,
            body: JSON.stringify(params),
        });

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => '');
            return jsonError(upstream.status, text || `Upstream error: ${upstream.statusText}`);
        }

        const contentType = upstream.headers.get('content-type') || 'text/event-stream';

        return new Response(upstream.body, {
            status: upstream.status,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (e: any) {
        return jsonError(502, `Proxy error: ${e.message}`);
    }
};
