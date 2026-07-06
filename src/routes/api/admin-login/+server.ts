import { jsonError, jsonOk } from '$lib/auth';

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

    // Set a simple session cookie for admin access
    event.cookies.set('admin_session', 'authenticated', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 86400,
    });

    return jsonOk({ ok: true });
};
