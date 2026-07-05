import { jsonError } from '../../../../../lib/auth';
import { getBucket, getFile } from '../../../../../lib/r2';

export const GET = async (event) => {
    const path = event.params.path;
    if (!path) return jsonError(400, 'path is required');

    const bucket = getBucket(event.platform!);
    const object = await getFile(bucket, path);
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
