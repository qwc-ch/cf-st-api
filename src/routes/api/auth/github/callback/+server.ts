import { generateSalt, hashPassword, jsonError, setSessionCookie } from '../../../../../lib/auth';
import { createUser, getUserByHandle } from '../../../../../lib/db';

export const GET = async (event) => {
    const code = event.url.searchParams.get('code');
    if (!code) return jsonError(400, 'Missing code parameter');

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const allowedUsers = process.env.ALLOWED_GITHUB_USERS || '';
    if (!clientId || !clientSecret) return jsonError(500, 'GitHub OAuth not configured');

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) return jsonError(500, 'FRONTEND_URL not configured');

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    if (!tokenRes.ok) return jsonError(502, 'Failed to exchange code with GitHub');
    const tokenData: any = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) return jsonError(502, `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`);

    const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) return jsonError(502, 'Failed to fetch GitHub user');
    const githubUser: any = await userRes.json();
    const ghLogin = githubUser.login as string;
    const ghName = githubUser.name || githubUser.login;

    if (allowedUsers) {
        const allowed = allowedUsers.split(',').map((s: string) => s.trim().toLowerCase());
        if (!allowed.includes(ghLogin.toLowerCase())) {
            const redirectUrl = `${frontendUrl}/login.html?error=github_not_allowed`;
            return new Response(`<script>window.location.href=${JSON.stringify(redirectUrl)}</script>`, {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            });
        }
    }

    const handle = ghLogin.toLowerCase();
    const existing = await getUserByHandle(handle);

    if (existing) {
        setSessionCookie(event, handle);
    } else {
        const salt = generateSalt();
        const passwordHash = hashPassword(ghLogin, salt);
        await createUser({
            handle,
            name: ghName,
            password_hash: passwordHash,
            salt,
            admin: 0,
        });
        setSessionCookie(event, handle);
    }

    const redirectUrl = frontendUrl;
    return new Response(`<script>window.location.href=${JSON.stringify(redirectUrl)}</script>`, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
    });
};
