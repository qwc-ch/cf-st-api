import { jsonError, jsonOk } from '../../../../lib/auth';
import { getUserByHandle } from '../../../../lib/db';

async function handleGetAvatar(event: any) {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    try {
        const user = await getUserByHandle(event.locals.user.handle);
        return jsonOk({ avatar_url: user?.avatar_url || null });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
}

export const GET = handleGetAvatar;
export const POST = handleGetAvatar;
