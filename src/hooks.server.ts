import type { Handle } from '@sveltejs/kit';
import { getAuthUser } from './lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.user = await getAuthUser(event);

    const response = await resolve(event);
    return response;
};
