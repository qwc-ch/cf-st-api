import { jsonError, jsonOk } from '../../../../lib/auth';

const ESTIMATED_TOKENS_PER_CHAR: Record<string, number> = {
    gpt2: 0.25,
    openai: 0.25,
    claude: 0.2,
    llama: 0.3,
    llama3: 0.3,
    mistral: 0.3,
    mixtral: 0.3,
    gemma: 0.3,
    qwen2: 0.25,
    deepseek: 0.25,
    yi: 0.3,
    jamba: 0.25,
    'command-r': 0.25,
    'command-a': 0.25,
    nemo: 0.3,
    nerdstash: 0.3,
    nerdstash_v2: 0.3,
};

function getModel(path: string): string | null {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'remote') return parts[1] || null;
    return parts[0] || null;
}

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const url = new URL(event.request.url);
    const path = url.pathname.replace(/^\/api\/tokenizers\//, '');

    if (path.endsWith('/count')) {
        const model = url.searchParams.get('model') || 'openai';
        const body = await event.request.json().catch(() => ({}));
        const text: string = body.text || body.content || '';
        const ratio = ESTIMATED_TOKENS_PER_CHAR[model] || 0.25;
        return jsonOk({ count: Math.ceil(text.length * ratio) });
    }

    if (path.endsWith('/encode')) {
        const modelPath = path.replace(/\/encode$/, '');
        const model = getModel(modelPath);
        const body = await event.request.json().catch(() => ({}));
        const text: string = body.text || body.content || '';
        const ratio = ESTIMATED_TOKENS_PER_CHAR[model || 'gpt2'] || 0.25;
        return jsonOk({
            count: Math.ceil(text.length * ratio),
            ids: [],
        });
    }

    if (path.endsWith('/decode')) {
        return jsonOk({ text: '' });
    }

    return jsonError(404, 'Unknown tokenizer endpoint');
};
