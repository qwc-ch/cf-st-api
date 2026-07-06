import { generateSalt, hashPassword, jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    const { handle, token, password } = await event.request.json().catch(() => ({}));
    if (!handle || !token || !password) return jsonError(400, 'handle, token, and password are required');

    const userRows = (await sql('SELECT * FROM users WHERE handle = $1', [handle])) as {
        id: number;
        reset_token: string | null;
        reset_expiry: number | null;
    }[];
    const user = userRows[0];

    if (!user || user.reset_token !== token || !user.reset_expiry || user.reset_expiry < Date.now()) {
        return jsonError(400, 'Invalid or expired token');
    }
    const salt = generateSalt();
    const password_hash = hashPassword(password, salt);
    await sql(
        'UPDATE users SET password_hash = $1, salt = $2, reset_token = NULL, reset_expiry = NULL WHERE handle = $3',
        [password_hash, salt, handle],
    );

    return jsonOk({ ok: true });
};
