import { jsonError } from '../../lib/auth';

export const GET = async (event) => {
    const path = event.url.searchParams.get('path');
    if (!path) return jsonError(400, 'Missing path');

    const publicUrl = process.env.PUBLIC_STORAGE_URL;
    if (publicUrl) {
        return new Response(null, {
            status: 302,
            headers: { Location: `${publicUrl}/${path}` },
        });
    }

    return new Response(null, {
        status: 302,
        headers: { Location: `/api/files/raw/${path}` },
    });
};
