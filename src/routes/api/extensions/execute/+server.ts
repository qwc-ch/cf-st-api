import { jsonError } from '../../../../lib/auth';

export const POST = async (_event) => {
    return jsonError(501, 'not available in cloud');
};
