import { generateSalt, hashPassword, jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Not logged in');
    const { password } = await event.request.json().catch(() => ({}));
    if (!password) return jsonError(400, 'Password is required');

    const salt = generateSalt();
    const password_hash = hashPassword(password, salt);
    await sql('UPDATE users SET password_hash = $1, salt = $2 WHERE handle = $3', [
        password_hash,
        salt,
        event.locals.user.handle,
    ]);

    return jsonOk({ ok: true });
};
