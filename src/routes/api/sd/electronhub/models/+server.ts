import { jsonOk } from '../../../../../lib/auth';

const MODELS = ['SDXL', 'SD 1.5', 'SD 2.1', 'SDXL Turbo', 'Playground v2'];

export const GET = async () => {
    return jsonOk(MODELS);
};
