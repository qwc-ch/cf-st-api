import { jsonError, jsonOk } from '../../../../../../lib/auth';

const PROVIDERS = ['aimlapi', 'pollinations', 'nanogpt', 'chutes', 'electronhub', 'mistral', 'xai', 'moonshot'];

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { api_key } = body;
    const url = new URL(event.request.url);
    const provider = url.pathname.replace(/^\/api\/backends\/chat-completions\/multimodal-models\//, '');

    if (!provider || provider === 'multimodal-models') {
        return jsonOk(PROVIDERS);
    }

    const upstreamUrls: Record<string, string> = {
        aimlapi: 'https://api.aimlapi.com/v1/models',
        pollinations: 'https://text.pollinations.ai/models',
        nanogpt: 'https://api.nanogpt.ai/v1/models',
        chutes: 'https://api.chutes.ai/v1/models',
        electronhub: 'https://api.electronhub.ai/v1/models',
        mistral: 'https://api.mistral.ai/v1/models',
        xai: 'https://api.x.ai/v1/models',
        moonshot: 'https://api.moonshot.cn/v1/models',
        workers_ai: '',
    };

    const upstreamUrl = upstreamUrls[provider];
    if (!upstreamUrl) return jsonOk({ data: [] });

    try {
        if (provider === 'workers_ai') {
            return jsonOk({ data: [] });
        }

        const resp = await fetch(upstreamUrl, {
            headers: api_key ? { Authorization: `Bearer ${api_key}` } : {},
            signal: AbortSignal.timeout(10000),
        });
        if (!resp.ok) return jsonOk({ data: [] });
        const data = await resp.json();
        const multimodal = (data.data || data.models || []).filter(
            (m: any) =>
                m.id?.toLowerCase().includes('vision') ||
                m.id?.toLowerCase().includes('omni') ||
                m.id?.toLowerCase().includes('multimodal'),
        );
        return jsonOk({ data: multimodal });
    } catch {
        return jsonOk({ data: [] });
    }
};
