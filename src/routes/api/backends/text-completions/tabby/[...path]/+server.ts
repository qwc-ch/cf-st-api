import { jsonError, jsonOk } from '../../../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const _body = await event.request.json().catch(() => ({}));
    const url = new URL(event.request.url);
    const path = url.pathname.replace(/^\/api\/backends\/text-completions\/tabby\//, '');

    if (path === 'download') {
        return jsonOk({ ok: false, error: 'download not available in cloud' });
    }

    return jsonError(404, 'Unknown tabby endpoint');
};
