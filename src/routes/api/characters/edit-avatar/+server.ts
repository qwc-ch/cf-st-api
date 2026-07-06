import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterById, updateCharacter } from '../../../../lib/db';
import { uploadFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const formData = await event.request.formData().catch(() => null);
    if (!formData) return jsonError(400, 'Invalid form data');

    const id = parseInt(formData.get('id') as string, 10);
    const avatar = formData.get('avatar');
    if (!id || !avatar || typeof avatar === 'string') return jsonError(400, 'id and avatar are required');

    const char = await getCharacterById(id, event.locals.user.handle);
    if (!char) return jsonError(404, 'Character not found');

    const arrayBuf = await avatar.arrayBuffer();
    const ext = avatar.type === 'image/png' ? 'png' : avatar.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `char-${id}-avatar.${ext}`;
    const key = `${event.locals.user.handle}/characters/${filename}`;

    await uploadFile(key, arrayBuf, avatar.type);

    const publicUrl = process.env.PUBLIC_STORAGE_URL
        ? `${process.env.PUBLIC_STORAGE_URL}/${key}`
        : `/api/files/raw/${key}`;

    await updateCharacter(id, event.locals.user.handle, { avatar_url: publicUrl });

    return jsonOk({ avatar_url: publicUrl });
};
