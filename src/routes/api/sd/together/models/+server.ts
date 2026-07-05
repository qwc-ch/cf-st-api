import { jsonOk } from '../../../../../lib/auth';

const MODELS = [
    'stabilityai/stable-diffusion-xl-base-1.0',
    'runwayml/stable-diffusion-v1-5',
    'prompthero/openjourney',
    'stabilityai/sdxl-turbo',
];

export const GET = async () => {
    return jsonOk(MODELS);
};
