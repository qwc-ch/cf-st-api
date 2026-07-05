import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { getBucket, isImageType, uploadImage } from '../../../../lib/r2';

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

    const bucket = getBucket(event.platform!);
    const key = await uploadImage(
        bucket,
        event.locals.user.handle,
        'backgrounds',
        `${Date.now()}-${name}`,
        arrayBuf,
        contentType,
    );

    const db = getDb(event.platform!);
    const now = Date.now();
    await db
        .prepare(
            'INSERT INTO backgrounds (user_handle, name, path, data, created) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_handle, name) DO UPDATE SET path = excluded.path, data = excluded.data',
        )
        .bind(event.locals.user.handle, name, key, '{}', now)
        .run();

    const publicUrl = event.platform!.env.PUBLIC_R2_URL
        ? `${event.platform!.env.PUBLIC_R2_URL}/${key}`
        : `/api/files/raw/${key}`;

    return jsonOk({ path: publicUrl, name });
};
