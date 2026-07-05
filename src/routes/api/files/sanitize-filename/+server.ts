import { jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    const { name } = await event.request.json().catch(() => ({}));
    const sanitized = (name || '')
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
        .replace(/\.\./g, '_')
        .trim();
    return jsonOk({ sanitized });
};
