import { jsonError, jsonOk } from '../../../../lib/auth';
import { getAllCharacters, getDb } from '../../../../lib/db';

async function handleGetCharacters(event: any) {
    if (!event.locals.user) return jsonError(401, 'Unauthorized');
    const db = getDb(event.platform!);
    const characters = await getAllCharacters(db, event.locals.user.handle);
    return jsonOk(characters);
}

export const GET = handleGetCharacters;
export const POST = handleGetCharacters;
