import { jsonError, jsonOk } from '../../../../lib/auth';
import { getAllCharacters, getChatsForCharacter, getSettings } from '../../../../lib/db';
import { uploadFile } from '../../../../lib/r2';

export const POST = async (event) => {
    if (!event.locals.user?.admin) return jsonError(403, 'Admin required');

    const characters = await getAllCharacters(event.locals.user.handle);
    const chats = []; // Would need a separate list function
    const settings = await getSettings(event.locals.user.handle);

    const backup = { characters, chats, settings, timestamp: Date.now() };
    const backupKey = `backups/${event.locals.user.handle}-${Date.now()}.json`;

    await uploadFile(backupKey, JSON.stringify(backup), 'application/json');

    return jsonOk({ path: backupKey });
};
