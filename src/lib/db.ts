import { neon } from '@neondatabase/serverless';

function getClient() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL environment variable is required');
    return neon(url);
}

let _client: ReturnType<typeof neon> | null = null;
function ensureClient() {
    if (!_client) _client = getClient();
    return _client;
}

// sql supports both tagged template and function-call syntax
export function sql(strings: TemplateStringsArray | string, ...values: unknown[]): Promise<unknown[]> {
    const c = ensureClient();
    if (Array.isArray(strings) && 'raw' in strings) {
        // Tagged template: sql`SELECT * FROM users WHERE id = ${id}`
        return (c as any)(strings as TemplateStringsArray, ...values) as Promise<unknown[]>;
    }
    // Function call: sql('SELECT * FROM users WHERE id = $1', [id])
    // neon driver uses .query() for function-call syntax
    return (c as any).query(strings, values?.[0]) as Promise<unknown[]>;
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

export async function getUserByHandle(handle: string): Promise<User | null> {
    const rows = await sql`SELECT * FROM users WHERE handle = ${handle}`;
    return (rows as User[])[0] ?? null;
}

export async function getUserById(id: number): Promise<User | null> {
    const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
    return (rows as User[])[0] ?? null;
}

export async function listUsers(): Promise<User[]> {
    return sql(
        'SELECT id, handle, name, admin, enabled, created, avatar_url FROM users ORDER BY created ASC',
    ) as Promise<User[]>;
}

export async function createUser(user: {
    handle: string;
    name: string;
    password_hash: string | null;
    salt: string | null;
    admin: number;
}): Promise<User> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO users (handle, name, password_hash, salt, admin, enabled, created) VALUES ($1, $2, $3, $4, $5, 1, $6) RETURNING *',
        [user.handle, user.name, user.password_hash, user.salt, user.admin, now],
    );
    return (rows as User[])[0];
}

export async function ensureUserExists(handle: string): Promise<void> {
    const existing = await getUserByHandle(handle);
    if (existing) return;
    // Auto-create user for admin auth fallback
    const isAdmin = handle === process.env.ADMIN_USERNAME;
    await createUser({
        handle,
        name: handle,
        password_hash: null,
        salt: null,
        admin: isAdmin ? 1 : 0,
    });
}

export async function updateUserPassword(handle: string, password_hash: string, salt: string): Promise<void> {
    await sql('UPDATE users SET password_hash = $1, salt = $2 WHERE handle = $3', [password_hash, salt, handle]);
}

export async function deleteUser(handle: string): Promise<void> {
    await sql('DELETE FROM users WHERE handle = $1', [handle]);
}

export async function setUserEnabled(handle: string, enabled: number): Promise<void> {
    await sql('UPDATE users SET enabled = $1 WHERE handle = $2', [enabled, handle]);
}

export async function setUserAdmin(handle: string, admin: number): Promise<void> {
    await sql('UPDATE users SET admin = $1 WHERE handle = $2', [admin, handle]);
}

export async function updateUserName(handle: string, name: string): Promise<void> {
    await sql('UPDATE users SET name = $1 WHERE handle = $2', [name, handle]);
}

export async function updateUserAvatar(handle: string, avatar_url: string): Promise<void> {
    await sql('UPDATE users SET avatar_url = $1 WHERE handle = $2', [avatar_url, handle]);
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

export async function getAllCharacters(userHandle: string): Promise<Character[]> {
    return sql('SELECT * FROM characters WHERE user_handle = $1 ORDER BY updated DESC', [userHandle]) as Promise<
        Character[]
    >;
}

export async function getCharacterById(id: number, userHandle: string): Promise<Character | null> {
    const rows = await sql('SELECT * FROM characters WHERE id = $1 AND user_handle = $2', [id, userHandle]);
    return (rows as Character[])[0] ?? null;
}

export async function createCharacter(c: Omit<Character, 'id' | 'created' | 'updated'>): Promise<Character> {
    const now = Date.now();
    const rows = await sql(
        `INSERT INTO characters (user_handle, avatar_url, name, description, personality, scenario, first_mes, mes_example, creator_notes, system_prompt, post_history_instructions, tags, creator, character_version, extensions, data, spec_version, spec, created, updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
        [
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
        ],
    );
    return (rows as Character[])[0];
}

export async function updateCharacter(
    id: number,
    userHandle: string,
    c: Partial<Omit<Character, 'id' | 'user_handle' | 'created'>>,
): Promise<void> {
    const now = Date.now();
    const sets: string[] = ['updated = $1'];
    const values: (string | number | null)[] = [now];
    let paramIndex = 2;
    for (const [key, value] of Object.entries(c)) {
        sets.push(`${key} = $${paramIndex}`);
        values.push(value as string | number | null);
        paramIndex++;
    }
    values.push(id, userHandle);
    await sql(
        `UPDATE characters SET ${sets.join(', ')} WHERE id = $${paramIndex} AND user_handle = $${paramIndex + 1}`,
        values,
    );
}

export async function deleteCharacter(id: number, userHandle: string): Promise<void> {
    await sql('DELETE FROM characters WHERE id = $1 AND user_handle = $2', [id, userHandle]);
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

export async function getChatsForCharacter(userHandle: string, characterId: number): Promise<Chat[]> {
    return sql('SELECT * FROM chats WHERE user_handle = $1 AND character_id = $2 ORDER BY updated DESC', [
        userHandle,
        characterId,
    ]) as Promise<Chat[]>;
}

export async function getChatById(id: number, userHandle: string): Promise<Chat | null> {
    const rows = await sql('SELECT * FROM chats WHERE id = $1 AND user_handle = $2', [id, userHandle]);
    return (rows as Chat[])[0] ?? null;
}

export async function createChat(chat: { user_handle: string; character_id: number; name: string }): Promise<Chat> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO chats (user_handle, character_id, name, created, updated) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [chat.user_handle, chat.character_id, chat.name, now, now],
    );
    return (rows as Chat[])[0];
}

export async function deleteChat(id: number, userHandle: string): Promise<void> {
    await sql('DELETE FROM messages WHERE chat_id = $1', [id]);
    await sql('DELETE FROM chats WHERE id = $1 AND user_handle = $2', [id, userHandle]);
}

export async function getMessages(chatId: number): Promise<Message[]> {
    return sql('SELECT * FROM messages WHERE chat_id = $1 ORDER BY message_id ASC', [chatId]) as Promise<Message[]>;
}

export async function saveMessage(msg: {
    chat_id: number;
    role: string;
    name: string;
    content: string;
    extra: string | null;
    message_id: number;
}): Promise<Message> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO messages (chat_id, role, name, content, extra, created, message_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [msg.chat_id, msg.role, msg.name, msg.content, msg.extra, now, msg.message_id],
    );
    return (rows as Message[])[0];
}

export async function deleteMessages(chatId: number): Promise<void> {
    await sql('DELETE FROM messages WHERE chat_id = $1', [chatId]);
}

// ── Settings ──
export async function getSettings(userHandle: string): Promise<string | null> {
    const rows = await sql('SELECT value FROM settings WHERE user_handle = $1', [userHandle]);
    const row = (rows as { value: string }[])[0];
    return row?.value ?? null;
}

export async function saveSettings(userHandle: string, value: string): Promise<void> {
    await sql(
        'INSERT INTO settings (user_handle, value) VALUES ($1, $2) ON CONFLICT (user_handle) DO UPDATE SET value = EXCLUDED.value',
        [userHandle, value],
    );
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

export async function getWorldInfos(userHandle: string): Promise<WorldInfo[]> {
    return sql('SELECT * FROM world_infos WHERE user_handle = $1 ORDER BY updated DESC', [userHandle]) as Promise<
        WorldInfo[]
    >;
}

export async function getWorldInfoById(id: number, userHandle: string): Promise<WorldInfo | null> {
    const rows = await sql('SELECT * FROM world_infos WHERE id = $1 AND user_handle = $2', [id, userHandle]);
    return (rows as WorldInfo[])[0] ?? null;
}

export async function saveWorldInfo(wi: { user_handle: string; name: string; entries: string }): Promise<WorldInfo> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO world_infos (user_handle, name, entries, created, updated) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_handle, name) DO UPDATE SET entries = EXCLUDED.entries, updated = EXCLUDED.updated RETURNING *',
        [wi.user_handle, wi.name, wi.entries, now, now],
    );
    return (rows as WorldInfo[])[0];
}

export async function deleteWorldInfo(id: number, userHandle: string): Promise<void> {
    await sql('DELETE FROM world_infos WHERE id = $1 AND user_handle = $2', [id, userHandle]);
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

export async function getGroups(userHandle: string): Promise<ChatGroup[]> {
    return sql('SELECT * FROM chat_groups WHERE user_handle = $1 ORDER BY updated DESC', [userHandle]) as Promise<
        ChatGroup[]
    >;
}

export async function saveGroup(g: {
    user_handle: string;
    name: string;
    members: string;
    data: string;
}): Promise<ChatGroup> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO chat_groups (user_handle, name, members, data, created, updated) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_handle, name) DO UPDATE SET members = EXCLUDED.members, data = EXCLUDED.data, updated = EXCLUDED.updated RETURNING *',
        [g.user_handle, g.name, g.members, g.data, now, now],
    );
    return (rows as ChatGroup[])[0];
}

export async function deleteGroup(id: number, userHandle: string): Promise<void> {
    await sql('DELETE FROM chat_groups WHERE id = $1 AND user_handle = $2', [id, userHandle]);
}

// ── Settings Snapshots ──

export interface SettingsSnapshot {
    id: number;
    user_handle: string;
    name: string;
    value: string;
    created: number;
}

export async function getSnapshots(userHandle: string): Promise<SettingsSnapshot[]> {
    return sql('SELECT * FROM settings_snapshots WHERE user_handle = $1 ORDER BY created DESC', [
        userHandle,
    ]) as Promise<SettingsSnapshot[]>;
}

export async function createSnapshot(snap: {
    user_handle: string;
    name: string;
    value: string;
}): Promise<SettingsSnapshot> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO settings_snapshots (user_handle, name, value, created) VALUES ($1, $2, $3, $4) RETURNING *',
        [snap.user_handle, snap.name, snap.value, now],
    );
    return (rows as SettingsSnapshot[])[0];
}

export async function deleteSnapshot(id: number, userHandle: string): Promise<void> {
    await sql('DELETE FROM settings_snapshots WHERE id = $1 AND user_handle = $2', [id, userHandle]);
}

// ── Backgrounds ──

export interface Background {
    id: number;
    user_handle: string;
    name: string;
    path: string;
    data: string;
    created: number;
}

export async function getBackgrounds(userHandle: string): Promise<Background[]> {
    return sql('SELECT * FROM backgrounds WHERE user_handle = $1 ORDER BY created DESC', [userHandle]) as Promise<
        Background[]
    >;
}

export async function getBackgroundById(id: number, userHandle: string): Promise<Background | null> {
    const rows = await sql('SELECT * FROM backgrounds WHERE id = $1 AND user_handle = $2', [id, userHandle]);
    return (rows as Background[])[0] ?? null;
}

export async function findBackgroundByName(userHandle: string, name: string): Promise<Background | null> {
    const rows = await sql('SELECT * FROM backgrounds WHERE user_handle = $1 AND name = $2', [userHandle, name]);
    return (rows as Background[])[0] ?? null;
}

export async function createBackground(bg: {
    user_handle: string;
    name: string;
    path: string;
    data: string;
}): Promise<Background> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO backgrounds (user_handle, name, path, data, created) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [bg.user_handle, bg.name, bg.path, bg.data, now],
    );
    return (rows as Background[])[0];
}

export async function deleteBackground(id: number, userHandle: string): Promise<void> {
    await sql('DELETE FROM backgrounds WHERE id = $1 AND user_handle = $2', [id, userHandle]);
}

export async function renameBackground(id: number, userHandle: string, name: string): Promise<void> {
    await sql('UPDATE backgrounds SET name = $1 WHERE id = $2 AND user_handle = $3', [name, id, userHandle]);
}

// ── Tags ──

export interface Tag {
    id: number;
    user_handle: string;
    name: string;
    color: string;
    created: number;
}

export async function getTags(userHandle: string): Promise<Tag[]> {
    return sql('SELECT * FROM tags WHERE user_handle = $1 ORDER BY name ASC', [userHandle]) as Promise<Tag[]>;
}

export async function setTag(t: { user_handle: string; name: string; color: string }): Promise<Tag> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO tags (user_handle, name, color, created) VALUES ($1, $2, $3, $4) ON CONFLICT (user_handle, name) DO UPDATE SET color = EXCLUDED.color RETURNING *',
        [t.user_handle, t.name, t.color, now],
    );
    return (rows as Tag[])[0];
}

export async function deleteTag(id: number, userHandle: string): Promise<void> {
    await sql('DELETE FROM tags WHERE id = $1 AND user_handle = $2', [id, userHandle]);
}

// ── Presets ──

export interface Preset {
    user_handle: string;
    name: string;
    api_id: string;
    value: string;
    created: number;
    updated: number;
}

export async function getPresets(userHandle: string): Promise<Preset[]> {
    return sql('SELECT * FROM presets WHERE user_handle = $1 ORDER BY name ASC', [userHandle]) as Promise<Preset[]>;
}

export async function savePreset(p: {
    user_handle: string;
    name: string;
    api_id: string;
    value: string;
}): Promise<Preset> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO presets (user_handle, name, api_id, value, created, updated) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_handle, name) DO UPDATE SET api_id = EXCLUDED.api_id, value = EXCLUDED.value, updated = EXCLUDED.updated RETURNING *',
        [p.user_handle, p.name, p.api_id, p.value, now, now],
    );
    return (rows as Preset[])[0];
}

export async function deletePreset(userHandle: string, name: string): Promise<void> {
    await sql('DELETE FROM presets WHERE user_handle = $1 AND name = $2', [userHandle, name]);
}

// ── Secrets ──

export interface Secret {
    id: string;
    user_handle: string;
    key_name: string;
    value: string;
    label: string;
    active: number;
    created: number;
}

export async function getSecrets(userHandle: string): Promise<Secret[]> {
    return sql('SELECT * FROM secrets WHERE user_handle = $1 ORDER BY created DESC', [userHandle]) as Promise<Secret[]>;
}

export async function getSecret(id: string, userHandle: string): Promise<Secret | null> {
    const rows = await sql('SELECT * FROM secrets WHERE id = $1 AND user_handle = $2', [id, userHandle]);
    return (rows as Secret[])[0] ?? null;
}

export async function createSecret(s: {
    id: string;
    user_handle: string;
    key_name: string;
    value: string;
    label: string;
}): Promise<Secret> {
    const now = Date.now();
    const rows = await sql(
        'INSERT INTO secrets (id, user_handle, key_name, value, label, active, created) VALUES ($1, $2, $3, $4, $5, 1, $6) RETURNING *',
        [s.id, s.user_handle, s.key_name, s.value, s.label, now],
    );
    return (rows as Secret[])[0];
}

export async function updateSecret(
    id: string,
    userHandle: string,
    updates: { key_name?: string; value?: string; label?: string; active?: number },
): Promise<void> {
    const sets: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;
    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            sets.push(`${key} = $${paramIndex}`);
            values.push(value as string | number);
            paramIndex++;
        }
    }
    if (sets.length === 0) return;
    values.push(id, userHandle);
    await sql(
        `UPDATE secrets SET ${sets.join(', ')} WHERE id = $${paramIndex} AND user_handle = $${paramIndex + 1}`,
        values,
    );
}

export async function deleteSecret(id: string, userHandle: string): Promise<void> {
    await sql('DELETE FROM secrets WHERE id = $1 AND user_handle = $2', [id, userHandle]);
}
