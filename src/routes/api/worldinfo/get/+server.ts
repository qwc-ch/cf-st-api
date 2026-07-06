import { jsonError, jsonOk } from '../../../../lib/auth';
import { getWorldInfoByName, getWorldInfos } from '../../../../lib/db';

export const GET = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const name = event.url.searchParams.get('name');
    if (name) {
        const wi = await getWorldInfoByName(event.locals.user.handle, name);
        return wi ? jsonOk(wi) : jsonOk({ result: 'file not find' });
    }
    const list = await getWorldInfos(event.locals.user.handle);
    return jsonOk(list);
};

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const { name } = await event.request.json().catch(() => ({}));

    if (name) {
        const wi = await getWorldInfoByName(event.locals.user.handle, name);
        if (wi) {
            return jsonOk({
                ...wi,
                entries: (() => {
                    try {
                        return JSON.parse(wi.entries);
                    } catch {
                        return [];
                    }
                })(),
            });
        }
        return jsonOk({ result: 'file not find' });
    }

    const list = await getWorldInfos(event.locals.user.handle);
    return jsonOk(list);
};
