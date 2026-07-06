import { jsonOk } from '../../../../lib/auth';
import { listUsers } from '../../../../lib/db';

export const GET = async (event) => {
    const users = await listUsers();
    return jsonOk(users);
};
