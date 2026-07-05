import { jsonError, jsonOk } from '../../../../../lib/auth';

export const GET = async (_event) => {
    try {
        const response = await fetch('https://nano-gpt.com/api/models/providers', {
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        return jsonOk(data);
    } catch (e: any) {
        return jsonError(502, `Proxy error: ${e.message}`);
    }
};
