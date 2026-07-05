import { jsonError } from '../../../../lib/auth';

export const GET = async (_event) => {
    return jsonError(404, 'not available');
};
