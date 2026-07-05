/// <reference types="@cloudflare/workers-types" />

declare namespace App {
    interface Platform {
        env: {
            DB: D1Database;
            ASSETS_BUCKET: R2Bucket;
            PUBLIC_R2_URL?: string;
            SESSION_SECRET?: string;
            GITHUB_CLIENT_ID?: string;
            GITHUB_CLIENT_SECRET?: string;
            ALLOWED_GITHUB_USERS?: string;
            FRONTEND_URL?: string;
        };
        context: ExecutionContext;
        caches: CacheStorage;
    }

    interface Locals {
        user: { handle: string; admin: boolean } | null;
    }

    type PageData = {};

    interface Error {
        message: string;
        status?: number;
    }
}
