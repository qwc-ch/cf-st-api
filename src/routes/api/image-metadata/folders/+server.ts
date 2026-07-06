import { jsonError, jsonOk } from '../../../../lib/auth';
import { copyFile, deleteFile, deletePrefix, getFileBuffer, listPrefix, uploadFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { action, name, new_name } = body;

    const prefix = `${event.locals.user.handle}/images/`;

    if (action === 'get') {
        const result = await listPrefix(prefix, '/');
        const folders = (result.delimitedPrefixes || []).map((p: string) => ({
            name: p.replace(prefix, '').replace(/\/$/, ''),
            path: p,
        }));
        return jsonOk(folders);
    }

    if (action === 'create') {
        if (!name) return jsonError(400, 'name is required');
        await uploadFile(`${prefix}${name}/.keep`, new Uint8Array(0));
        return jsonOk({ ok: true });
    }

    if (action === 'update' || action === 'rename') {
        if (!name || !new_name) return jsonError(400, 'name and new_name are required');
        const oldPrefix = `${prefix}${name}/`;
        const newPrefix = `${prefix}${new_name}/`;
        const result = await listPrefix(oldPrefix);
        for (const obj of result.objects) {
            const newKey = obj.key.replace(oldPrefix, newPrefix);
            const data = await getFileBuffer(obj.key);
            if (data) {
                await uploadFile(newKey, data);
                await deleteFile(obj.key);
            }
        }
        return jsonOk({ ok: true });
    }

    if (action === 'delete') {
        if (!name) return jsonError(400, 'name is required');
        const delPrefix = `${prefix}${name}/`;
        const count = await deletePrefix(delPrefix);
        return jsonOk({ ok: true, deleted: count });
    }

    if (action === 'assign') {
        return jsonOk({ ok: true });
    }

    if (action === 'unassign') {
        return jsonOk({ ok: true });
    }

    if (action === 'set-thumbnails') {
        return jsonOk({ ok: true });
    }

    return jsonError(400, 'Unknown action');
};
