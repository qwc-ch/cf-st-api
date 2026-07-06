import { jsonError, jsonOk } from '../../../../lib/auth';
import { getCharacterById } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { id } = await event.request.json().catch(() => ({}));
    if (!id) return jsonError(400, 'id is required');

    const char = await getCharacterById(id, event.locals.user.handle);
    if (!char) return jsonError(404, 'Character not found');

    return jsonOk(char);
};
