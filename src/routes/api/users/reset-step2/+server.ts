import { generateSalt, hashPassword, jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    const { handle, token, password } = await event.request.json().catch(() => ({}));
    if (!handle || !token || !password) return jsonError(400, 'handle, token, and password are required');

    const db = getDb(event.platform!);
    const user = await db
        .prepare('SELECT * FROM users WHERE handle = ?')
        .bind(handle)
        .first<{ id: number; reset_token: string | null; reset_expiry: number | null }>();

    if (!user || user.reset_token !== token || !user.reset_expiry || user.reset_expiry < Date.now()) {
        return jsonError(400, 'Invalid or expired token');
    }

    const salt = generateSalt();
    const password_hash = hashPassword(password, salt);
    await db
        .prepare(
            'UPDATE users SET password_hash = ?, salt = ?, reset_token = NULL, reset_expiry = NULL WHERE handle = ?',
        )
        .bind(password_hash, salt, handle)
        .run();

    return jsonOk({ ok: true });
};
