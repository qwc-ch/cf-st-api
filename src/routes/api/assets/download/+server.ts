import { jsonError, jsonOk } from '../../../../lib/auth';
import { uploadFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { url, folder } = body;
    if (!url) return jsonError(400, 'url is required');

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) return jsonError(502, 'Failed to download asset');
        const arrayBuf = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const filename = url.split('/').pop() || `asset-${Date.now()}`;
        const cat = folder || 'assets';
        const key = `${event.locals.user.handle}/${cat}/${filename}`;
        await uploadFile(key, arrayBuf, contentType);
        return jsonOk({ key, path: `/api/files/raw/${key}` });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
