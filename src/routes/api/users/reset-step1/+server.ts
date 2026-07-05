import crypto from 'node:crypto';
import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    const { handle } = await event.request.json().catch(() => ({}));
    if (!handle) return jsonError(400, 'handle is required');

    const db = getDb(event.platform!);
    const user = await db.prepare('SELECT * FROM users WHERE handle = ?').bind(handle).first<{ id: number }>();
    if (!user) return jsonOk({ ok: true }); // Don't reveal if user exists

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour
    await db
        .prepare('UPDATE users SET reset_token = ?, reset_expiry = ? WHERE handle = ?')
        .bind(token, expiry, handle)
        .run();

    return jsonOk({ ok: true });
};
