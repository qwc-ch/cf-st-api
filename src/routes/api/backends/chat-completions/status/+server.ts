import { jsonError } from '../../../../../lib/auth';
import { sql } from '../../../../../lib/db';

function jsonOk(data: Record<string, unknown>): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

const PROVIDER_API_URLS: Record<string, string> = {
    openai: 'https://api.openai.com/v1/models',
    openrouter: 'https://openrouter.ai/api/v1/models',
    ai21: 'https://api.ai21.com/studio/v1/models',
    cohere: 'https://api.cohere.ai/v1/models',
    perplexity: 'https://api.perplexity.ai/models',
    groq: 'https://api.groq.com/openai/v1/models',
    deepseek: 'https://api.deepseek.com/v1/models',
    xai: 'https://api.x.ai/v1/models',
    aimlapi: 'https://api.aimlapi.com/v1/models',
    mistralai: 'https://api.mistral.ai/v1/models',
    nanogpt: 'https://api.nanogpt.ai/v1/models',
    chutes: 'https://api.chutes.ai/v1/models',
    electronhub: 'https://api.electronhub.ai/v1/models',
    moonshot: 'https://api.moonshot.cn/v1/models',
    fireworks: 'https://api.fireworks.ai/inference/v1/models',
};

const CHAT_SOURCE_TO_SECRET_KEY: Record<string, string> = {
    openai: 'api_key_openai',
    openrouter: 'api_key_openrouter',
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
    custom: 'api_key_custom',
    claude: 'api_key_claude',
    makersuite: 'api_key_makersuite',
    vertexai: 'api_key_vertexai',
    pollinations: 'api_key_pollinations',
    cometapi: 'api_key_cometapi',
    zai: 'api_key_zai',
    siliconflow: 'api_key_siliconflow',
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
    const { chat_completion_source, custom_url } = body;
    const source = chat_completion_source ?? '';

    // Resolve API key: prefer body.api_key, fall back to DB secret
    const secretKeyName = CHAT_SOURCE_TO_SECRET_KEY[source];
    let api_key = body.api_key;
    if (!api_key && secretKeyName) {
        api_key = await getSecretKey(event.locals.user.handle, secretKeyName);
    }

    // Custom source: proxy models from custom_url
    if (source === 'custom') {
        if (!custom_url) return jsonOk({ bypass: true });
        try {
            const baseUrl = custom_url.replace(/\/+$/, '');
            const modelsUrl = baseUrl.includes('v1') ? `${baseUrl}/models` : `${baseUrl}/v1/models`;
            const resp = await fetch(modelsUrl, {
                headers: api_key ? { Authorization: `Bearer ${api_key}` } : {},
                signal: AbortSignal.timeout(10000),
            });
            if (resp.ok) {
                const data = await resp.json();
                return jsonOk({ data: data.data || data.models || [], bypass: true });
            }
        } catch {}
        return jsonOk({ bypass: true });
    }

    // Known providers: proxy upstream /v1/models
    const upstreamUrl = PROVIDER_API_URLS[source];
    if (upstreamUrl) {
        try {
            const resp = await fetch(upstreamUrl, {
                headers: {
                    ...(api_key ? { Authorization: `Bearer ${api_key}` } : {}),
                },
                signal: AbortSignal.timeout(10000),
            });
            if (resp.ok) {
                const data = await resp.json();
                return jsonOk({ data: data.data || data.models || [] });
            }
            const text = await resp.text().catch(() => '');
            return jsonOk({ error: `Upstream error: ${resp.status} ${text}` });
        } catch (e: any) {
            return jsonOk({ error: `Connection error: ${e.message}` });
        }
    }

    return jsonOk({ status: 'ok' });
};
