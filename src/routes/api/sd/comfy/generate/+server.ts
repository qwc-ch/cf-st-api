import { jsonError, jsonOk } from '../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { url, prompt } = body;
    if (!url) return jsonError(400, 'url is required');
    if (!prompt) return jsonError(400, 'prompt is required');

    try {
        const apiServer = url;

        const res = await fetch(`${apiServer}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: typeof prompt === 'string' ? prompt : JSON.stringify({ prompt }),
        });
        if (!res.ok) return jsonError(res.status, await res.text());
        const { prompt_id } = await res.json();

        let history: any;
        for (let i = 0; i < 60; i++) {
            await new Promise((r) => setTimeout(r, 1000));
            const hres = await fetch(`${apiServer}/history/${prompt_id}`);
            if (hres.ok) {
                const hdata = await hres.json();
                if (hdata[prompt_id]) {
                    history = hdata[prompt_id];
                    break;
                }
            }
        }
        if (!history) return jsonError(504, 'ComfyUI generation timed out');

        const outputs = history.outputs || {};
        for (const nodeId of Object.keys(outputs)) {
            const nodeOutput = outputs[nodeId];
            const images = nodeOutput.images;
            if (images && images.length > 0) {
                const img = images[0];
                const imgUrl = `${apiServer}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${encodeURIComponent(img.type || 'output')}`;
                const imgRes = await fetch(imgUrl);
                if (imgRes.ok) {
                    const blob = await imgRes.arrayBuffer();
                    const base64 = btoa(String.fromCharCode(...new Uint8Array(blob)));
                    const ext = (img.filename || '').split('.').pop()?.toLowerCase() || 'png';
                    return jsonOk({ format: ext, data: base64 });
                }
            }
        }

        return jsonError(500, 'No image found in ComfyUI output');
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
