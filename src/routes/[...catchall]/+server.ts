import type { RequestEvent } from '@sveltejs/kit';
import indexHtml from '../../../static/index.html?raw';

export const GET = (event: RequestEvent) => {
    if (!event.locals.user) {
        return new Response(null, {
            status: 302,
            headers: { location: '/login' },
        });
    }
    return new Response(indexHtml, {
        headers: { 'content-type': 'text/html' },
    });
};
