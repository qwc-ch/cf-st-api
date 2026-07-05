import { clearSessionCookie, jsonOk } from '../../../../lib/auth';

export const POST = async (event) => {
    clearSessionCookie(event);
    return jsonOk({ ok: true });
};
