import { jsonError, jsonOk } from '../../../../lib/auth';
import { uploadFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { name, sprite_data } = body;
    if (!name || !sprite_data) return jsonError(400, 'Missing name or sprite_data');

    try {
        const base64Data = sprite_data.split(',')[1] || sprite_data;
        const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const key = `${event.locals.user.handle}/sprites/${name}`;
        await uploadFile(key, buffer, 'image/png');
        return jsonOk({ ok: true, key });
    } catch (e: any) {
        return jsonError(502, `Error: ${e.message}`);
    }
};
