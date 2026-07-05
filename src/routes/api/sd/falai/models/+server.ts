import { jsonOk } from '../../../../../lib/auth';

const MODELS = [
    'fal-ai/flux/schnell',
    'fal-ai/flux/dev',
    'fal-ai/flux-pro',
    'fal-ai/sdxl-turbo',
    'fal-ai/stable-diffusion-v3',
    'fal-ai/playground-v2',
];

export const GET = async () => {
    return jsonOk(MODELS);
};
