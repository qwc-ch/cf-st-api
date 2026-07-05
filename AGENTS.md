# SillyTavern Backend — Agent Guide

## Stack

- SvelteKit 2 + Svelte 5 (server-only API, no frontend routes)
- Adapter: `@sveltejs/adapter-cloudflare` — Worker entrypoint is `.svelte-kit/cloudflare/_worker.js`
- TypeScript strict, moduleResolution `bundler`

## Platform bindings

| Binding | Type | Access in code |
|---|---|---|
| `DB` | D1 (SQLite) | `event.platform.env.DB` |
| `ASSETS_BUCKET` | R2 | `event.platform.env.ASSETS_BUCKET` |
| `PUBLIC_R2_URL` | secret/var | `event.platform.env.PUBLIC_R2_URL` |

Types are declared in `src/app.d.ts`. Bindings are configured in `wrangler.toml` — **no `.env` file**.

## Commands

```bash
pnpm dev              # vite dev — uses platformProxy from wrangler.toml to mock D1/R2
pnpm build            # vite build
pnpm preview          # vite preview (uses built worker)
pnpm deploy           # wrangler deploy
pnpm lint             # biome lint src/
pnpm format           # biome format --write src/
pnpm check            # biome check --write src/  (format + lint + organize imports)
pnpm db:migrate       # wrangler d1 migrations apply sillytavern-db
pnpm db:generate      # wrangler d1 migrations create <name>
```

There is no `typecheck` or `test` script. No test framework is configured.

## Database

- D1 (Cloudflare's SQLite-compatible edge DB).
- Migrations live in `migrations/` — plain SQL, applied sequentially by wrangler.
- Create a migration: `npm run db:generate my-migration-name` — edit the created `.sql` file, then `npm run db:migrate`.
- Schema: 10 tables — `users`, `characters`, `chats`, `messages`, `settings`, `world_infos`, `chat_groups`, `backgrounds`, `tags`, `settings_snapshots`, plus `presets` and `secrets` in `migrations/0002_presets_secrets.sql`.

## Auth

- Cookie-based sessions (HMAC-signed, no JWTs). Cookie name: `sillytavern_session`.
- `SESSION_SECRET` can be set as a secret on the Worker; if not set the HMAC uses SHA-256 of the cookie body as key (weak — set the secret in production).
- Session expiration: 24h, encoded in the token payload.
- `event.locals.user` is set by `hooks.server.ts` on every request.
- `requireAuth(event)` throws `Error('Unauthorized')` if no valid session.

## CORS

- Handled in `src/hooks.server.ts` — both OPTIONS preflight and response header injection.
- Allowed origins: `localhost:8000`, `localhost:8787`, `127.0.0.1:8000`, `127.0.0.1:8787`, `https://sillytavern.pages.dev`, `https://*.sillytavern.pages.dev`, plus any `localhost`/`127.0.0.1` origin in dev.
- Allow-Credentials is true (cookies).
- Adding a new allowed origin means editing `ALLOWED_ORIGINS` in `src/hooks.server.ts`.

## API structure

All routes under `src/routes/api/`. Each subdirectory is a SvelteKit server route (`+server.ts`). The API is REST-style:
- `/api/users` — user CRUD (login/logout/create/delete/list/me/change-password/slugify/backup/avatar/name/promote/demote/enable/disable/get/recover/reset)
- `/api/characters` — character CRUD (create/get/all/delete/duplicate/export/import/rename/merge-attributes/chats)
- `/api/chats` — chat & message CRUD (get/save/delete/rename/export/import/recent/search)
- `/api/groups`, `/api/worldinfo`, `/api/backgrounds`, `/api/tags`, `/api/stats`
- `/api/settings` — user settings + snapshot management
- `/api/presets` — preset save/delete/restore (stored in D1)
- `/api/secrets` — API key management (write/read/delete/rotate/rename/view/find/settings)
- `/api/files`, `/api/images` — R2 upload/download (via `src/lib/r2.ts`)
- `/api/backends/chat-completions`, `/api/backends/text-completions` — generic LLM proxies
- `/api/backends/kobold` — KoboldAI generate/status/transcribe/embed
- `/api/openai`, `/api/anthropic`, `/api/google`, `/api/novelai` — provider-specific endpoints
- `/api/horde` — AI Horde text/image generation
- `/api/sd` — Stable Diffusion WebUI + ComfyUI + 15+ image providers
- `/api/openrouter`, `/api/nanogpt` — model/provider listings
- `/api/azure`, `/api/volcengine`, `/api/minimax` — additional LLM backends
- `/api/speech`, `/api/translate` — TTS/STT and translation
- `/api/vector` — text embeddings
- `/api/themes`, `/api/avatars`, `/api/sprites`, `/api/moving-ui` — UI resources
- `/api/extensions`, `/api/quick-replies` — extensions
- `/api/content` — URL content import
- `/api/backups`, `/api/data-maid`, `/api/image-metadata` — data tools
- `/api/tokenizers` — token counting (stub)
- `/api/ping` — health check
- `/api/plugins` — (empty, reserved)
- `/csrf-token` — CSRF token endpoint
- `/thumbnail` — image thumbnail redirect

## R2 file storage

- `src/lib/r2.ts` — upload/list/get/delete helpers.
- Uploads stored at `{userHandle}/{category}/{filename}`.
- Allowed MIME types: images (png/jpeg/webp/gif/bmp), plus avif, video (mp4/webm), audio (mpeg/ogg/wav/flac/aac/mp4).
- `getPublicUrl()` returns R2 public URL if `PUBLIC_R2_URL` is set, otherwise falls back to `/api/files/raw/{key}`.

## Deploy

`deploy.sh` runs: `npm install` → `npm run build` → `wrangler d1 migrations apply sillytavern-db` → `wrangler deploy`.

First-time setup requires:
1. `npx wrangler d1 create sillytavern-db` — copy returned ID into `wrangler.toml`
2. `npx wrangler r2 bucket create sillytavern-assets`
3. Optionally `npx wrangler r2 bucket create sillytavern-assets --public` and set `PUBLIC_R2_URL`

## Notable quirks

- No test infrastructure exists.
- Formatter/linter: Biome — config in `biome.json` (4-space indent, single quotes, 120 width). Use `pnpm check` to auto-format all files.
- `tsconfig.json` extends `.svelte-kit/tsconfig.json` (generated by SvelteKit on `pnpm dev` or `pnpm build`). Editing `tsconfig.json` may be overwritten if you edit the wrong section.
- `src/hooks/` directory exists but is empty — not used.
- `ALLOWED_ORIGINS` in `hooks.server.ts` controls CORS — any new frontend domain must be added there.
- `wrangler.toml` must have `[assets]` section (directory + binding) for adapter-cloudflare v7+ to work, even for API-only Workers.
