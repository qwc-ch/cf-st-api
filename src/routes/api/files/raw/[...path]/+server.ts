import { jsonError } from '../../../../../lib/auth';
import { getFile } from '../../../../../lib/r2';

export const GET = async (event) => {
    const path = event.params.path;
    if (!path) return jsonError(400, 'path is required');

    const object = await getFile(path);
    if (!object) return jsonError(404, 'File not found');

    const headers: Record<string, string> = {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
    };
    if (object.size !== undefined) {
        headers['Content-Length'] = String(object.size);
    }

    return new Response(object.body as ReadableStream, { headers });
};
