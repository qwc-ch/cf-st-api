#!/bin/bash
set -e

echo "=== SillyTavern API Backend Deploy ==="

# Step 1: Install dependencies
echo "Installing dependencies..."
pnpm install

# Step 2: Build
echo "Building..."
pnpm build

# Step 3: Run migrations
echo "Running D1 migrations..."
npx wrangler d1 migrations apply sillytavern-db

# Step 4: Deploy
echo "Deploying to Cloudflare Workers..."
pnpm deploy

echo "=== Done! ==="
echo ""
echo "Next steps:"
echo "1. Deploy frontend (public/) to Cloudflare Pages"
echo "2. Add _redirects file: /api/* https://sillytavern-api.workers.dev/api/* 200"
