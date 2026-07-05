-- Initial D1 schema for SillyTavern API
-- Run: wrangler d1 migrations apply sillytavern-db

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handle TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    password_hash TEXT,
    salt TEXT,
    admin INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    created INTEGER NOT NULL,
    avatar_url TEXT,
    reset_token TEXT,
    reset_expiry INTEGER
);

CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    avatar_url TEXT,
    name TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    personality TEXT NOT NULL DEFAULT '',
    scenario TEXT NOT NULL DEFAULT '',
    first_mes TEXT NOT NULL DEFAULT '',
    mes_example TEXT NOT NULL DEFAULT '',
    creator_notes TEXT NOT NULL DEFAULT '',
    system_prompt TEXT NOT NULL DEFAULT '',
    post_history_instructions TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    creator TEXT NOT NULL DEFAULT '',
    character_version TEXT NOT NULL DEFAULT '',
    extensions TEXT NOT NULL DEFAULT '{}',
    data TEXT NOT NULL DEFAULT '{}',
    spec_version TEXT NOT NULL DEFAULT '',
    spec TEXT NOT NULL DEFAULT '',
    created INTEGER NOT NULL,
    updated INTEGER NOT NULL
);
CREATE INDEX idx_characters_user ON characters(user_handle);
CREATE INDEX idx_characters_name ON characters(name);

CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    created INTEGER NOT NULL,
    updated INTEGER NOT NULL
);
CREATE INDEX idx_chats_user ON chats(user_handle);
CREATE INDEX idx_chats_character ON chats(character_id);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    name TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    extra TEXT,
    created INTEGER NOT NULL,
    message_id INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_messages_chat ON messages(chat_id);

CREATE TABLE IF NOT EXISTS settings (
    user_handle TEXT PRIMARY KEY REFERENCES users(handle) ON DELETE CASCADE,
    value TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS world_infos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    name TEXT NOT NULL,
    entries TEXT NOT NULL DEFAULT '[]',
    created INTEGER NOT NULL,
    updated INTEGER NOT NULL,
    UNIQUE(user_handle, name)
);
CREATE INDEX idx_worldinfos_user ON world_infos(user_handle);

CREATE TABLE IF NOT EXISTS chat_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    members TEXT NOT NULL DEFAULT '[]',
    data TEXT NOT NULL DEFAULT '{}',
    created INTEGER NOT NULL,
    updated INTEGER NOT NULL,
    UNIQUE(user_handle, name)
);
CREATE INDEX idx_groups_user ON chat_groups(user_handle);

CREATE TABLE IF NOT EXISTS settings_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT '{}',
    created INTEGER NOT NULL
);
CREATE INDEX idx_snapshots_user ON settings_snapshots(user_handle);

CREATE TABLE IF NOT EXISTS backgrounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    created INTEGER NOT NULL,
    UNIQUE(user_handle, name)
);
CREATE INDEX idx_bg_user ON backgrounds(user_handle);

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#808080',
    created INTEGER NOT NULL,
    UNIQUE(user_handle, name)
);
CREATE INDEX idx_tags_user ON tags(user_handle);
