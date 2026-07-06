import type { Handle, HandleServerError } from '@sveltejs/kit';
import { getAuthUser } from './lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.user = await getAuthUser(event);

    const response = await resolve(event);
    return response;
};

export const handleError: HandleServerError = async ({ error }) => {
    console.error('Server error:', error);
    return {
        message: 'Internal Server Error',
        status: 500,
    };
};
