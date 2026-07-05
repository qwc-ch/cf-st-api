import crypto from 'node:crypto';
import { jsonError, jsonOk } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export const POST = async (event) => {
    const { handle } = await event.request.json().catch(() => ({}));
    if (!handle) return jsonError(400, 'handle is required');

    const db = getDb(event.platform!);
    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = Date.now() + 1800000; // 30 minutes

    // In production, send this code via email.
    // For now, log it so the user can see it in server logs.
    console.log(`[RECOVERY] Code for ${handle}: ${code}`);

    await db
        .prepare('UPDATE users SET reset_token = ?, reset_expiry = ? WHERE handle = ?')
        .bind(code, expiry, handle)
        .run();

    return jsonOk({ ok: true });
};
