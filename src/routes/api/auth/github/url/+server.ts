import { jsonError, jsonOk } from '../../../../../lib/auth';

export const GET = async (event) => {
    const clientId = event.platform?.env?.GITHUB_CLIENT_ID;
    if (!clientId) return jsonError(500, 'GitHub OAuth not configured');

    const frontendUrl = event.platform?.env?.FRONTEND_URL;
    if (!frontendUrl) return jsonError(500, 'FRONTEND_URL not configured');

    const redirectUri = `${frontendUrl}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;

    return jsonOk({ url });
};
