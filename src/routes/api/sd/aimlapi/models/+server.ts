import { jsonOk } from '../../../../../lib/auth';

const MODELS = ['flux', 'flux-pro', 'sdxl', 'sd-1.5', 'dall-e-3'];

export const GET = async () => {
    return jsonOk(MODELS);
};
