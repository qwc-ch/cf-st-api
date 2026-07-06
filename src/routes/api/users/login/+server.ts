import { hashPassword, jsonError, jsonOk, setSessionCookie } from '../../../../lib/auth';
import { getUserByHandle } from '../../../../lib/db';

export const POST = async (event) => {
    try {
        const { handle, password } = await event.request.json();
        if (!handle) return jsonError(400, 'Handle is required');

        const user = await getUserByHandle(handle.toLowerCase().trim());

        if (!user) return jsonError(401, 'Invalid credentials');
        if (!user.enabled) return jsonError(403, 'Account disabled');

        if (user.password_hash && user.salt) {
            if (!password) return jsonError(401, 'Password required');
            const hash = hashPassword(password, user.salt);
            if (hash !== user.password_hash) return jsonError(401, 'Invalid credentials');
        }

        setSessionCookie(event, user.handle);
        return jsonOk({ handle: user.handle, name: user.name, admin: !!user.admin });
    } catch (_e) {
        return jsonError(400, 'Invalid request');
    }
};
