import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket, isAllowedMediaType, uploadImage } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const formData = await event.request.formData().catch(() => null);
    if (!formData) return jsonError(400, 'Invalid form data');

    const file = formData.get('file') || formData.get('image');
    if (!file || typeof file === 'string') return jsonError(400, 'No file uploaded');

    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || 'application/octet-stream';

    if (!isAllowedMediaType(contentType)) return jsonError(400, 'Unsupported file type');

    const category = (formData.get('category') as string) || 'files';
    const filename = `${Date.now()}-${(file as File).name || 'file'}`;

    const bucket = getBucket(event.platform!);
    const key = await uploadImage(bucket, event.locals.user.handle, category, filename, arrayBuf, contentType);

    return jsonOk({ path: `/api/files/raw/${key}`, key, name: (file as File).name });
};
