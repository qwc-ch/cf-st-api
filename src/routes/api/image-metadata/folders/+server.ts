import { jsonError, jsonOk } from '../../../../lib/auth';
import { getBucket } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const { action, name, new_name } = body;

    const prefix = `${event.locals.user.handle}/images/`;
    const bucket = getBucket(event.platform!);

    if (action === 'get') {
        const objects = await bucket.list({ prefix, delimiter: '/' });
        const folders = (objects.delimitedPrefixes || []).map((p: string) => ({
            name: p.replace(prefix, '').replace(/\/$/, ''),
            path: p,
        }));
        return jsonOk(folders);
    }

    if (action === 'create') {
        if (!name) return jsonError(400, 'name is required');
        await bucket.put(`${prefix}${name}/.keep`, new Uint8Array(0));
        return jsonOk({ ok: true });
    }

    if (action === 'update' || action === 'rename') {
        if (!name || !new_name) return jsonError(400, 'name and new_name are required');
        const oldPrefix = `${prefix}${name}/`;
        const newPrefix = `${prefix}${new_name}/`;
        const objects = await bucket.list({ prefix: oldPrefix });
        for (const obj of objects.objects) {
            const newKey = obj.key.replace(oldPrefix, newPrefix);
            await bucket.put(newKey, await bucket.get(obj.key).then((r) => r?.arrayBuffer() || new ArrayBuffer(0)));
            await bucket.delete(obj.key);
        }
        return jsonOk({ ok: true });
    }

    if (action === 'delete') {
        if (!name) return jsonError(400, 'name is required');
        const delPrefix = `${prefix}${name}/`;
        const objects = await bucket.list({ prefix: delPrefix });
        for (const obj of objects.objects) await bucket.delete(obj.key);
        return jsonOk({ ok: true, deleted: objects.objects.length });
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
