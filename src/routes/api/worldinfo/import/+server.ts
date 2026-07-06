import { jsonError, jsonOk } from '../../../../lib/auth';
import { saveWorldInfo } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');

    const contentType = event.request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
        const formData = await event.request.formData();
        const file = (formData.get('avatar') as File) || null;
        const name = (formData.get('name') as string) || '';
        if (!file || !name) return jsonError(400, 'File and name are required');

        const text = await file.text();
        let data: any;
        try {
            data = JSON.parse(text);
        } catch {
            return jsonError(400, 'Invalid JSON file');
        }

        const entries = data.entries || [];
        const resolvedName = data.name || name;

        const wi = await saveWorldInfo({
            user_handle: event.locals.user.handle,
            name: resolvedName,
            entries: JSON.stringify(entries),
        });

        return jsonOk({ ...wi, entries: JSON.parse(wi.entries) });
    }

    const { name, entries } = await event.request.json().catch(() => ({}));
    if (!name || !entries) return jsonError(400, 'name and entries are required');

    const wi = await saveWorldInfo({
        user_handle: event.locals.user.handle,
        name,
        entries: JSON.stringify(entries),
    });
    return jsonOk(wi);
};
