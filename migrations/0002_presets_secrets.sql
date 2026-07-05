-- Presets and secrets tables for SillyTavern API

CREATE TABLE IF NOT EXISTS presets (
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    name TEXT NOT NULL,
    api_id TEXT NOT NULL DEFAULT '',
    value TEXT NOT NULL DEFAULT '{}',
    created INTEGER NOT NULL,
    updated INTEGER NOT NULL,
    UNIQUE(user_handle, name)
);
CREATE INDEX idx_presets_user ON presets(user_handle);

CREATE TABLE IF NOT EXISTS secrets (
    id TEXT PRIMARY KEY,
    user_handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created INTEGER NOT NULL
);
CREATE INDEX idx_secrets_user ON secrets(user_handle);
CREATE INDEX idx_secrets_key ON secrets(user_handle, key_name);
