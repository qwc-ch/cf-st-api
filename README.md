# SillyTavern API Backend (Cloudflare Workers)

SvelteKit backend for SillyTavern, deployable on Cloudflare Workers with D1 and R2.

## Setup

```bash
# Install dependencies
npm install

# Run dev server (uses local D1 and R2 mocks)
npm run dev

# Build for production
npm run build
```

## D1 Database

```bash
# Create the D1 database (first time only)
npx wrangler d1 create sillytavern-db
# Copy the database_id into wrangler.toml

# Apply migrations
npm run db:migrate

# Create a new migration
npm run db:generate <migration-name>
```

## R2 Bucket

```bash
# Create the R2 bucket (first time only)
npx wrangler r2 bucket create sillytavern-assets

# Optional: create a public URL for the bucket
npx wrangler r2 bucket create sillytavern-assets --public
# Set PUBLIC_R2_URL in wrangler.toml to the public URL
```

## Deploy

```bash
npm run deploy
```

## Architecture

- `/api/*` routes: SvelteKit server endpoints
- `DB`: D1 database binding for structured data
- `ASSETS_BUCKET`: R2 bucket for images and files

## Frontend Deployment

### Option 1: Cloudflare Pages (recommended)

1. Deploy `public/` directory to Cloudflare Pages
2. The `_redirects` file proxies `/api/*` to the backend Worker

### Option 2: Frontend Worker

1. Add `BACKEND_URL` secret: `wrangler secret put BACKEND_URL`
2. Deploy: `npx wrangler deploy`

## Environment Variables

| Variable | Binding | Description |
|---|---|---|
| `DB` | D1 | Database for users, characters, chats, settings |
| `ASSETS_BUCKET` | R2 | Object storage for images, avatars, backgrounds |
| `PUBLIC_R2_URL` | Secret | Optional public URL for direct R2 file access |
