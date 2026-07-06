import crypto from 'node:crypto';
import { jsonError, jsonOk } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';
export const POST = async (event) => {
    const { handle } = await event.request.json().catch(() => ({}));
    if (!handle) return jsonError(400, 'handle is required');

    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = Date.now() + 1800000; // 30 minutes

    // In production, send this code via email.
    // For now, log it so the user can see it in server logs.
    console.log(`[RECOVERY] Code for ${handle}: ${code}`);

    await sql('UPDATE users SET reset_token = $1, reset_expiry = $2 WHERE handle = $3', [code, expiry, handle]);

    return jsonOk({ ok: true });
};
