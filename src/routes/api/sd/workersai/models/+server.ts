import { jsonOk } from '../../../../../lib/auth';

const MODELS = [
    '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    '@cf/runwayml/stable-diffusion-v1-5-inpaint',
    '@cf/bytedance/stable-diffusion-xl-lightning',
];

export const GET = async () => {
    return jsonOk(MODELS);
};
