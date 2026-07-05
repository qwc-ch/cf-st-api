import { jsonError, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const body = await event.request.json().catch(() => ({}));
    const path = new URL(event.request.url).pathname;

    const probe = async (url: string) => {
        try {
            const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
            return { ok: resp.ok, contentType: resp.headers.get('content-type') };
        } catch {
            return { ok: false };
        }
    };

    const scrape = async (url: string) => {
        try {
            const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
            const text = await resp.text();
            return { content: text, url };
        } catch (e: any) {
            return { error: e.message };
        }
    };

    if (path.endsWith('/probe')) {
        if (!body.url) return jsonError(400, 'url is required');
        return jsonOk(await probe(body.url));
    }

    if (path.endsWith('/probe-mediawiki')) {
        if (!body.url) return jsonError(400, 'url is required');
        return jsonOk(await probe(body.url));
    }

    if (path.endsWith('/scrape') || path.endsWith('/scrape-mediawiki')) {
        if (!body.url) return jsonError(400, 'url is required');
        return jsonOk(await scrape(body.url));
    }

    return jsonOk([]);
};
