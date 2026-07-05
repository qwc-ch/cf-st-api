import type { R2Bucket } from '@cloudflare/workers-types';

export function getBucket(platform: App.Platform): R2Bucket {
    return platform.env.ASSETS_BUCKET;
}

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];
const ALLOWED_MEDIA_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    'image/avif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/mp4',
];

export function isImageType(mime: string): boolean {
    return ALLOWED_IMAGE_TYPES.includes(mime);
}

export function isAllowedMediaType(mime: string): boolean {
    return ALLOWED_MEDIA_TYPES.includes(mime);
}

export async function uploadFile(
    bucket: R2Bucket,
    key: string,
    data: ArrayBuffer,
    contentType: string,
): Promise<string> {
    await bucket.put(key, data, {
        httpMetadata: { contentType },
    });
    return key;
}

export async function uploadImage(
    bucket: R2Bucket,
    userHandle: string,
    category: string,
    filename: string,
    data: ArrayBuffer,
    contentType: string,
): Promise<string> {
    const key = `${userHandle}/${category}/${filename}`;
    await uploadFile(bucket, key, data, contentType);
    return key;
}

export async function getFile(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
    return bucket.get(key);
}

export async function deleteFile(bucket: R2Bucket, key: string): Promise<void> {
    await bucket.delete(key);
}

export async function listFiles(bucket: R2Bucket, prefix: string): Promise<string[]> {
    const objects = await bucket.list({ prefix });
    return objects.objects.map((o) => o.key);
}

export function getPublicUrl(platform: App.Platform, key: string): string {
    const publicUrl = platform.env.PUBLIC_R2_URL;
    if (publicUrl) {
        return `${publicUrl}/${key}`;
    }
    return `/api/files/raw/${key}`;
}
