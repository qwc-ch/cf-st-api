import { jsonOk } from '../../../lib/auth';

export const GET = async ({ url }) => {
    const extend = url.searchParams.get('extend');
    return jsonOk({ ok: true, extend: extend ? true : undefined });
};

export const POST = async () => {
    return jsonOk({ ok: true });
};
