import { json } from '@sveltejs/kit';

export const GET = async () => {
    return json({ agent: 'SillyTavern', pkgVersion: '1.12.0' });
};
