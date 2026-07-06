import { hashPassword, generateSalt, jsonError, jsonOk, setSessionCookie } from '$lib/auth';
import { getUserByHandle, createUser } from '$lib/db';

export const POST = async (event) => {
    const { username, password } = await event.request.json().catch(() => ({}));

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
        return jsonError(500, 'Admin login not configured');
    }

    if (username !== adminUser || password !== adminPass) {
        return jsonError(401, 'Invalid credentials');
    }

    let user = await getUserByHandle(adminUser);

    if (!user) {
        const salt = generateSalt();
        const password_hash = hashPassword(adminPass, salt);
        user = await createUser({
            handle: adminUser,
            name: adminUser,
            password_hash,
            salt,
            admin: 1,
        });
    }

    setSessionCookie(event, user.handle);

    return jsonOk({ ok: true });
};
