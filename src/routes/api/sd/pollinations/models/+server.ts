import { jsonOk } from '../../../../../lib/auth';

const MODELS = ['flux', 'flux-realism', 'flux-cablyai', 'flux-anime', 'flux-3d', 'any-dark'];

export const GET = async () => {
    return jsonOk(MODELS);
};
