import type { D1Database } from '@cloudflare/workers-types';

export function getDb(platform: App.Platform): D1Database {
    return platform.env.DB;
}

// ── Users ──
export interface User {
    id: number;
    handle: string;
    name: string;
    password_hash: string | null;
    salt: string | null;
    admin: number;
    enabled: number;
    created: number;
    avatar_url: string | null;
}

export async function getUserByHandle(db: D1Database, handle: string): Promise<User | null> {
    return db.prepare('SELECT * FROM users WHERE handle = ?').bind(handle).first<User>();
}

export async function getUserById(db: D1Database, id: number): Promise<User | null> {
    return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>();
}

export async function listUsers(db: D1Database): Promise<User[]> {
    return db
        .prepare('SELECT id, handle, name, admin, enabled, created, avatar_url FROM users ORDER BY created ASC')
        .all<User>()
        .then((r) => r.results);
}

export async function createUser(
    db: D1Database,
    user: { handle: string; name: string; password_hash: string | null; salt: string | null; admin: number },
): Promise<User> {
    const now = Date.now();
    const result = await db
        .prepare(
            'INSERT INTO users (handle, name, password_hash, salt, admin, enabled, created) VALUES (?, ?, ?, ?, ?, 1, ?) RETURNING *',
        )
        .bind(user.handle, user.name, user.password_hash, user.salt, user.admin, now)
        .first<User>();
    return result!;
}

export async function updateUserPassword(
    db: D1Database,
    handle: string,
    password_hash: string,
    salt: string,
): Promise<void> {
    await db
        .prepare('UPDATE users SET password_hash = ?, salt = ? WHERE handle = ?')
        .bind(password_hash, salt, handle)
        .run();
}

export async function deleteUser(db: D1Database, handle: string): Promise<void> {
    await db.prepare('DELETE FROM users WHERE handle = ?').bind(handle).run();
}

export async function setUserEnabled(db: D1Database, handle: string, enabled: number): Promise<void> {
    await db.prepare('UPDATE users SET enabled = ? WHERE handle = ?').bind(enabled, handle).run();
}

export async function setUserAdmin(db: D1Database, handle: string, admin: number): Promise<void> {
    await db.prepare('UPDATE users SET admin = ? WHERE handle = ?').bind(admin, handle).run();
}

export async function updateUserName(db: D1Database, handle: string, name: string): Promise<void> {
    await db.prepare('UPDATE users SET name = ? WHERE handle = ?').bind(name, handle).run();
}

export async function updateUserAvatar(db: D1Database, handle: string, avatar_url: string): Promise<void> {
    await db.prepare('UPDATE users SET avatar_url = ? WHERE handle = ?').bind(avatar_url, handle).run();
}

// ── Characters ──
export interface Character {
    id: number;
    user_handle: string;
    avatar_url: string | null;
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    creator_notes: string;
    system_prompt: string;
    post_history_instructions: string;
    tags: string;
    creator: string;
    character_version: string;
    extensions: string;
    data: string;
    spec_version: string;
    spec: string;
    created: number;
    updated: number;
}

export async function getAllCharacters(db: D1Database, userHandle: string): Promise<Character[]> {
    return db
        .prepare('SELECT * FROM characters WHERE user_handle = ? ORDER BY updated DESC')
        .bind(userHandle)
        .all<Character>()
        .then((r) => r.results);
}

export async function getCharacterById(db: D1Database, id: number, userHandle: string): Promise<Character | null> {
    return db
        .prepare('SELECT * FROM characters WHERE id = ? AND user_handle = ?')
        .bind(id, userHandle)
        .first<Character>();
}

export async function createCharacter(
    db: D1Database,
    c: Omit<Character, 'id' | 'created' | 'updated'>,
): Promise<Character> {
    const now = Date.now();
    const result = await db
        .prepare(
            `INSERT INTO characters (user_handle, avatar_url, name, description, personality, scenario, first_mes, mes_example, creator_notes, system_prompt, post_history_instructions, tags, creator, character_version, extensions, data, spec_version, spec, created, updated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        )
        .bind(
            c.user_handle,
            c.avatar_url,
            c.name,
            c.description,
            c.personality,
            c.scenario,
            c.first_mes,
            c.mes_example,
            c.creator_notes,
            c.system_prompt,
            c.post_history_instructions,
            c.tags,
            c.creator,
            c.character_version,
            c.extensions,
            c.data,
            c.spec_version,
            c.spec,
            now,
            now,
        )
        .first<Character>();
    return result!;
}

export async function updateCharacter(
    db: D1Database,
    id: number,
    userHandle: string,
    c: Partial<Omit<Character, 'id' | 'user_handle' | 'created'>>,
): Promise<void> {
    const now = Date.now();
    const sets: string[] = ['updated = ?'];
    const values: any[] = [now];
    for (const [key, value] of Object.entries(c)) {
        sets.push(`${key} = ?`);
        values.push(value);
    }
    values.push(id, userHandle);
    await db
        .prepare(`UPDATE characters SET ${sets.join(', ')} WHERE id = ? AND user_handle = ?`)
        .bind(...values)
        .run();
}

export async function deleteCharacter(db: D1Database, id: number, userHandle: string): Promise<void> {
    await db.prepare('DELETE FROM characters WHERE id = ? AND user_handle = ?').bind(id, userHandle).run();
}

// ── Chats ──
export interface Chat {
    id: number;
    user_handle: string;
    character_id: number;
    name: string;
    created: number;
    updated: number;
}

export interface Message {
    id: number;
    chat_id: number;
    role: string;
    name: string;
    content: string;
    extra: string | null;
    created: number;
    message_id: number;
}

export async function getChatsForCharacter(db: D1Database, userHandle: string, characterId: number): Promise<Chat[]> {
    return db
        .prepare('SELECT * FROM chats WHERE user_handle = ? AND character_id = ? ORDER BY updated DESC')
        .bind(userHandle, characterId)
        .all<Chat>()
        .then((r) => r.results);
}

export async function getChatById(db: D1Database, id: number, userHandle: string): Promise<Chat | null> {
    return db.prepare('SELECT * FROM chats WHERE id = ? AND user_handle = ?').bind(id, userHandle).first<Chat>();
}

export async function createChat(
    db: D1Database,
    chat: { user_handle: string; character_id: number; name: string },
): Promise<Chat> {
    const now = Date.now();
    const result = await db
        .prepare(
            'INSERT INTO chats (user_handle, character_id, name, created, updated) VALUES (?, ?, ?, ?, ?) RETURNING *',
        )
        .bind(chat.user_handle, chat.character_id, chat.name, now, now)
        .first<Chat>();
    return result!;
}

export async function deleteChat(db: D1Database, id: number, userHandle: string): Promise<void> {
    await db.prepare('DELETE FROM messages WHERE chat_id = ?').bind(id).run();
    await db.prepare('DELETE FROM chats WHERE id = ? AND user_handle = ?').bind(id, userHandle).run();
}

export async function getMessages(db: D1Database, chatId: number): Promise<Message[]> {
    return db
        .prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY message_id ASC')
        .bind(chatId)
        .all<Message>()
        .then((r) => r.results);
}

export async function saveMessage(
    db: D1Database,
    msg: { chat_id: number; role: string; name: string; content: string; extra: string | null; message_id: number },
): Promise<Message> {
    const now = Date.now();
    const result = await db
        .prepare(
            'INSERT INTO messages (chat_id, role, name, content, extra, created, message_id) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
        )
        .bind(msg.chat_id, msg.role, msg.name, msg.content, msg.extra, now, msg.message_id)
        .first<Message>();
    return result!;
}

export async function deleteMessages(db: D1Database, chatId: number): Promise<void> {
    await db.prepare('DELETE FROM messages WHERE chat_id = ?').bind(chatId).run();
}

// ── Settings ──
export async function getSettings(db: D1Database, userHandle: string): Promise<string | null> {
    const row = await db
        .prepare('SELECT value FROM settings WHERE user_handle = ?')
        .bind(userHandle)
        .first<{ value: string }>();
    return row?.value ?? null;
}

export async function saveSettings(db: D1Database, userHandle: string, value: string): Promise<void> {
    await db
        .prepare(
            'INSERT INTO settings (user_handle, value) VALUES (?, ?) ON CONFLICT(user_handle) DO UPDATE SET value = excluded.value',
        )
        .bind(userHandle, value)
        .run();
}

// ── World Info ──
export interface WorldInfo {
    id: number;
    user_handle: string;
    name: string;
    entries: string;
    created: number;
    updated: number;
}

export async function getWorldInfos(db: D1Database, userHandle: string): Promise<WorldInfo[]> {
    return db
        .prepare('SELECT * FROM world_infos WHERE user_handle = ? ORDER BY updated DESC')
        .bind(userHandle)
        .all<WorldInfo>()
        .then((r) => r.results);
}

export async function getWorldInfoById(db: D1Database, id: number, userHandle: string): Promise<WorldInfo | null> {
    return db
        .prepare('SELECT * FROM world_infos WHERE id = ? AND user_handle = ?')
        .bind(id, userHandle)
        .first<WorldInfo>();
}

export async function saveWorldInfo(
    db: D1Database,
    wi: { user_handle: string; name: string; entries: string },
): Promise<WorldInfo> {
    const now = Date.now();
    const result = await db
        .prepare(
            'INSERT INTO world_infos (user_handle, name, entries, created, updated) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_handle, name) DO UPDATE SET entries = excluded.entries, updated = excluded.updated RETURNING *',
        )
        .bind(wi.user_handle, wi.name, wi.entries, now, now)
        .first<WorldInfo>();
    return result!;
}

export async function deleteWorldInfo(db: D1Database, id: number, userHandle: string): Promise<void> {
    await db.prepare('DELETE FROM world_infos WHERE id = ? AND user_handle = ?').bind(id, userHandle).run();
}

// ── Groups ──
export interface ChatGroup {
    id: number;
    user_handle: string;
    name: string;
    members: string;
    data: string;
    created: number;
    updated: number;
}

export async function getGroups(db: D1Database, userHandle: string): Promise<ChatGroup[]> {
    return db
        .prepare('SELECT * FROM chat_groups WHERE user_handle = ? ORDER BY updated DESC')
        .bind(userHandle)
        .all<ChatGroup>()
        .then((r) => r.results);
}

export async function saveGroup(
    db: D1Database,
    g: { user_handle: string; name: string; members: string; data: string },
): Promise<ChatGroup> {
    const now = Date.now();
    const result = await db
        .prepare(
            'INSERT INTO chat_groups (user_handle, name, members, data, created, updated) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_handle, name) DO UPDATE SET members = excluded.members, data = excluded.data, updated = excluded.updated RETURNING *',
        )
        .bind(g.user_handle, g.name, g.members, g.data, now, now)
        .first<ChatGroup>();
    return result!;
}

export async function deleteGroup(db: D1Database, id: number, userHandle: string): Promise<void> {
    await db.prepare('DELETE FROM chat_groups WHERE id = ? AND user_handle = ?').bind(id, userHandle).run();
}
