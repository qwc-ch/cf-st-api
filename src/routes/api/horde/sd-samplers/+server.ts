import { jsonOk } from '../../../../lib/auth';

const SAMPLERS = [
    'k_lms',
    'k_euler',
    'k_euler_a',
    'k_heun',
    'k_dpm_2',
    'k_dpm_2_a',
    'k_dpm_fast',
    'k_dpm_adaptive',
    'k_dpmpp_2s_a',
    'k_dpmpp_2m',
    'ddim',
    'plms',
    'lcm',
];

export const GET = async () => {
    return jsonOk(SAMPLERS);
};
