import { jsonOk } from '../../../../../lib/auth';

const MODELS = ['sdxl-turbo', 'sd-xl', 'playground-v2', 'dreamshaper-xl', 'realvisxl'];

export const GET = async () => {
    return jsonOk(MODELS);
};
