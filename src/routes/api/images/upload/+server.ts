import { jsonError, jsonOk } from '../../../../lib/auth';
import { isImageType, uploadImage } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const formData = await event.request.formData().catch(() => null);
    if (!formData) return jsonError(400, 'Invalid form data');

    const file = formData.get('image') || formData.get('avatar') || formData.get('file');
    if (!file || typeof file === 'string') return jsonError(400, 'No file uploaded');

    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || 'application/octet-stream';

    if (!isImageType(contentType)) return jsonError(400, 'Unsupported image type');

    const category = (formData.get('category') as string) || 'uploads';
    const filename = `${Date.now()}-${(file as File).name || 'image'}`;

    const key = await uploadImage(event.locals.user.handle, category, filename, arrayBuf, contentType);

    const publicUrl = process.env.PUBLIC_STORAGE_URL
        ? `${process.env.PUBLIC_STORAGE_URL}/${key}`
        : `/api/files/raw/${key}`;

    return jsonOk({ path: publicUrl, key });
};
