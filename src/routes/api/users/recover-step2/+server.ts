import { generateSalt, hashPassword, jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    const { handle, code, newPassword } = await event.request.json().catch(() => ({}));
    if (!handle || !code || !newPassword) return jsonError(400, 'handle, code, and newPassword are required');

    const db = getDb(event.platform!);
    const user = await db
        .prepare('SELECT * FROM users WHERE handle = ?')
        .bind(handle)
        .first<{ id: number; reset_token: string | null; reset_expiry: number | null }>();

    if (!user || user.reset_token !== code || !user.reset_expiry || user.reset_expiry < Date.now()) {
        return jsonError(400, 'Invalid or expired code');
    }

    const salt = generateSalt();
    const password_hash = hashPassword(newPassword, salt);
    await db
        .prepare(
            'UPDATE users SET password_hash = ?, salt = ?, reset_token = NULL, reset_expiry = NULL WHERE handle = ?',
        )
        .bind(password_hash, salt, handle)
        .run();

    return jsonOk({ ok: true });
};
