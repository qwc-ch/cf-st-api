import { jsonOk } from '../../../../lib/auth';
import { getDb, listUsers } from '../../../../lib/db';

export const GET = async (event) => {
    const db = getDb(event.platform!);
    const users = await listUsers(db);
    return jsonOk(users);
};
