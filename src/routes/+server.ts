import indexHtml from '../../static/index.html?raw';

export const GET = () => new Response(indexHtml, {
    headers: { 'content-type': 'text/html' },
});
