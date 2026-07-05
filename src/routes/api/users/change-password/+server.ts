import { generateSalt, hashPassword, jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    if (!event.locals.user) return jsonError(401, 'Not logged in');
    const { password } = await event.request.json().catch(() => ({}));
    if (!password) return jsonError(400, 'Password is required');

    const db = getDb(event.platform!);
    const salt = generateSalt();
    const password_hash = hashPassword(password, salt);
    await db
        .prepare('UPDATE users SET password_hash = ?, salt = ? WHERE handle = ?')
        .bind(password_hash, salt, event.locals.user.handle)
        .run();

    return jsonOk({ ok: true });
};
