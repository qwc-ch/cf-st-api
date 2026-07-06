import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
import { isImageType, uploadImage } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const formData = await event.request.formData().catch(() => null);
    if (!formData) return jsonError(400, 'Invalid form data');

    const file = formData.get('image') || formData.get('file');
    const name = (formData.get('name') as string) || (file && typeof file !== 'string' ? (file as File).name : 'bg');

    if (!file || typeof file === 'string') return jsonError(400, 'No file uploaded');

    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || 'image/png';

    if (!isImageType(contentType)) return jsonError(400, 'Unsupported image type');

    const key = await uploadImage(
        event.locals.user.handle,
        'backgrounds',
        `${Date.now()}-${name}`,
        arrayBuf,
        contentType,
    );

    const now = Date.now();
    await sql(
        'INSERT INTO backgrounds (user_handle, name, path, data, created) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_handle, name) DO UPDATE SET path = EXCLUDED.path, data = EXCLUDED.data',
        [event.locals.user.handle, name, key, '{}', now],
    );

    const publicUrl = process.env.PUBLIC_STORAGE_URL
        ? `${process.env.PUBLIC_STORAGE_URL}/${key}`
        : `/api/files/raw/${key}`;

    return jsonOk({ path: publicUrl, name });
};
