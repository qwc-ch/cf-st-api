import { jsonError, jsonOk } from '../../../../../lib/auth';

export const GET = async (event) => {
    const prompt = event.url.searchParams.get('prompt');
    const model = event.url.searchParams.get('model') || 'flux';
    if (!prompt) return jsonError(400, 'prompt query param is required');

    try {
        const res = await fetch(
            `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}`,
        );
        if (!res.ok) return jsonError(res.status, await res.text());
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mime = res.headers.get('content-type') || 'image/jpeg';
        return jsonOk({ image: `data:${mime};base64,${base64}` });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
