import { jsonOk } from '../../../../../lib/auth';

const MODELS = ['sdxl', 'sd-1.5', 'sd-2.1'];

export const GET = async () => {
    return jsonOk(MODELS);
};
