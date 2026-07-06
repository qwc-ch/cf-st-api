import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        rollupOptions: {
            external: ['@aws-sdk/client-s3'],
        },
    },
    ssr: {
        external: ['@aws-sdk/client-s3'],
    },
});
