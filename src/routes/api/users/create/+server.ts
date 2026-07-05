import { generateSalt, hashPassword, jsonError, jsonOk } from '../../../../lib/auth';
import { createUser, getDb, getUserByHandle, listUsers } from '../../../../lib/db';

export const POST = async (event) => {
    try {
        const body = await event.request.json().catch(() => ({}));
        const { handle, name, password } = body;
        if (!handle) return jsonError(400, 'Handle is required');

        const db = getDb(event.platform!);
        const existing = await getUserByHandle(db, handle.toLowerCase().trim());
        if (existing) return jsonError(409, 'User already exists');

        let password_hash: string | null = null;
        let salt: string | null = null;
        if (password) {
            salt = generateSalt();
            password_hash = hashPassword(password, salt);
        }

        // First user is automatically admin
        const allUsers = await listUsers(db);
        const isFirstUser = allUsers.length === 0;

        const user = await createUser(db, {
            handle: handle.toLowerCase().trim(),
            name: name || handle,
            password_hash,
            salt,
            admin: isFirstUser ? 1 : 0,
        });

        return jsonOk({ handle: user.handle, name: user.name, admin: !!user.admin });
    } catch (e: any) {
        return jsonError(500, `Error: ${e?.message || e}`);
    }
};
