import { jsonError, jsonOk } from '../../../../lib/auth';
import { uploadImage } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const contentType = event.request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
        const formData = await event.request.formData();
        const file = formData.get('avatar') as File | null;
        const overwriteName = (formData.get('overwrite_name') as string) || '';

        if (!file) return jsonError(400, 'No file uploaded');

        const filename = overwriteName || file.name;
        const buffer = await file.arrayBuffer();
        const key = await uploadImage(event.locals.user.handle, 'avatar', filename, buffer, file.type);

        return jsonOk({ path: key, ok: true });
    }

    const body = await event.request.json().catch(() => ({}));
    const { avatar_data } = body;
    if (!avatar_data) return jsonError(400, 'Missing avatar_data');

    return jsonOk({ ok: true, avatar_url: avatar_data });
};
