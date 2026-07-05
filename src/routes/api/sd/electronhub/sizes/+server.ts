import { jsonOk } from '../../../../../lib/auth';

const SIZES = [
    '1024x1024',
    '1152x896',
    '1216x832',
    '1344x768',
    '1536x640',
    '640x1536',
    '768x1344',
    '832x1216',
    '896x1152',
];

export const GET = async () => {
    return jsonOk(SIZES);
};
