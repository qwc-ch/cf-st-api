import { jsonError, jsonOk } from '../../../../lib/auth';
import { uploadFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const formData = await event.request.formData().catch(() => null);
    if (!formData) return jsonError(400, 'Invalid form data');

    const file = formData.get('file') || formData.get('zip');
    if (!file || typeof file === 'string') return jsonError(400, 'No file uploaded');

    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || 'application/zip';
    const filename = `${Date.now()}-${(file as File).name || 'sprites.zip'}`;
    const key = `${event.locals.user.handle}/sprites/${filename}`;

    await uploadFile(key, arrayBuf, contentType);

    return jsonOk({ ok: true, key, name: (file as File).name });
};
