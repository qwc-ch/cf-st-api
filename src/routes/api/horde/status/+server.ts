import { jsonOk } from '../../../../lib/auth';

export const GET = async () => {
    return jsonOk({ ok: true });
};
