import crypto from 'node:crypto';
import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export const POST = async (event) => {
    const { handle } = await event.request.json().catch(() => ({}));
    if (!handle) return jsonError(400, 'handle is required');

    const rows = (await sql('SELECT * FROM users WHERE handle = $1', [handle])) as { id: number }[];
    const user = rows[0];
    if (!user) return jsonOk({ ok: true }); // Don't reveal if user exists

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour
    await sql('UPDATE users SET reset_token = $1, reset_expiry = $2 WHERE handle = $3', [token, expiry, handle]);

    return jsonOk({ ok: true });
};
