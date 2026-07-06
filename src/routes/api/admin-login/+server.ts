import { jsonError, jsonOk, setSessionCookie } from '$lib/auth';

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

    setSessionCookie(event, adminUser);

    return jsonOk({ ok: true });
};
