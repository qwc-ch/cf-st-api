import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
import { isImageType, uploadImage } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const formData = await event.request.formData().catch(() => null);
    if (!formData) return jsonError(400, 'Invalid form data');

    const file = formData.get('avatar') || formData.get('image');
    if (!file || typeof file === 'string') return jsonError(400, 'No file uploaded');

    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || 'image/png';
    if (!isImageType(contentType)) return jsonError(400, 'Unsupported image type');

    const key = await uploadImage(event.locals.user.handle, 'avatars', `avatar-${Date.now()}`, arrayBuf, contentType);

    const publicUrl = process.env.PUBLIC_STORAGE_URL
        ? `${process.env.PUBLIC_STORAGE_URL}/${key}`
        : `/api/files/raw/${key}`;

    await sql('UPDATE users SET avatar_url = $1 WHERE handle = $2', [publicUrl, event.locals.user.handle]);

    return jsonOk({ path: publicUrl });
};
