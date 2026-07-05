import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { getBucket, isImageType, uploadImage } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const formData = await event.request.formData().catch(() => null);
    if (!formData) return jsonError(400, 'Invalid form data');

    const file = formData.get('avatar') || formData.get('image');
    if (!file || typeof file === 'string') return jsonError(400, 'No file uploaded');

    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || 'image/png';
    if (!isImageType(contentType)) return jsonError(400, 'Unsupported image type');

    const bucket = getBucket(event.platform!);
    const key = await uploadImage(
        bucket,
        event.locals.user.handle,
        'avatars',
        `avatar-${Date.now()}`,
        arrayBuf,
        contentType,
    );

    const publicUrl = event.platform!.env.PUBLIC_R2_URL
        ? `${event.platform!.env.PUBLIC_R2_URL}/${key}`
        : `/api/files/raw/${key}`;

    const db = getDb(event.platform!);
    await db
        .prepare('UPDATE users SET avatar_url = ? WHERE handle = ?')
        .bind(publicUrl, event.locals.user.handle)
        .run();

    return jsonOk({ path: publicUrl });
};
