import { jsonError, jsonOk } from '../../../../lib/auth';
import { deleteCharacter, getCharacterById } from '../../../../lib/db';
import { deleteFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    const char = await getCharacterById(id, event.locals.user.handle);
    if (!char) return jsonError(404, 'Character not found');

    if (char.avatar_url) {
        // Extract key from URL or use as-is
        const key = char.avatar_url.replace(/^\/api\/files\/raw\//, '');
        await deleteFile(key).catch(() => {});
    }

    await deleteCharacter(id, event.locals.user.handle);
    return jsonOk({ ok: true });
};
