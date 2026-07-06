import { jsonError, jsonOk } from '../../../../lib/auth';
import { getUserByHandle } from '../../../../lib/db';
import { listFiles } from '../../../../lib/r2';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const avatar = event.url.searchParams.get('avatar');
    if (avatar) {
        return jsonOk({ path: avatar });
    }
    const files = await listFiles(`${event.locals.user.handle}/avatar`);
    return jsonOk({ avatars: files });
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { avatar } = body;
    if (avatar) {
        return jsonOk({ path: avatar });
    }
    const files = await listFiles(`${event.locals.user.handle}/avatar`);
    return jsonOk({ avatars: files });
};
