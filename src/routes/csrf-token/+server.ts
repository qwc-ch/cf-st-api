import crypto from 'node:crypto';

export const GET = async () => {
    const token = crypto.randomBytes(32).toString('base64');
    return new Response(JSON.stringify({ token }), {
        headers: { 'Content-Type': 'application/json' },
    });
};
