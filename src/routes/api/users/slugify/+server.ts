import { jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    const { name } = await event.request.json().catch(() => ({}));
    const slug = (name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, '_');
    return jsonOk({ slug });
};
