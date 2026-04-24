//app/api/(snowflakeUser)/projectImages/route.ts
// GET    — list existing images for a project from S3
// POST   — upload image(s) to S3 (base64), convert to WebP + thumbnail
// DELETE — remove an image + its thumbnail from S3
//
// Naming convention (matches legacy C# AmazonS3Helper):
//   {projectNumber}_main.webp
//   {projectNumber}_main_thumbnail.webp
//   {projectNumber}_image1.webp
//   {projectNumber}_image1_thumbnail.webp
//   {projectNumber}_image2.webp
//   {projectNumber}_image2_thumbnail.webp


import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
    ListObjectsV2Command,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '@/lib/s3';

// ─── Helpers ─────────────────────────────────────────────────────────

/** Build the S3 key: {projectNumber}/{fileName} */
function buildKey(projectNumber: string, fileName: string): string {
    return `${projectNumber.toLowerCase()}/${fileName}`;
}

/** Convert any image buffer to WebP at the given quality */
async function toWebP(buffer: Buffer, quality = 90): Promise<Buffer> {
    const sharp = (await import('sharp')).default;
    return sharp(buffer).webp({ quality }).toBuffer();
}

/** Generate a 20%-scale WebP thumbnail */
async function toThumbnail(buffer: Buffer): Promise<Buffer> {
    const sharp = (await import('sharp')).default;
    const meta = await sharp(buffer).metadata();
    const w = Math.round((meta.width ?? 400) * 0.2);
    return sharp(buffer).resize(w).webp({ quality: 80 }).toBuffer();
}

/** Strip the data URL prefix and return raw bytes */
function parseBase64(dataUrl: string): Buffer {
    const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
    return Buffer.from(match ? match[1] : dataUrl, 'base64');
}

/**
 * List all existing image keys for a project (excluding thumbnails),
 * return the set of gallery slot numbers already in use.
 *
 * e.g. ["sce-56-2026_image1.webp", "sce-56-2026_image3.webp"] → Set {1, 3}
 */
async function usedGallerySlots(pnLower: string): Promise<Set<number>> {
    const prefix = `${pnLower}/`;
    const result = await s3Client.send(new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: prefix,
    }));

    const used = new Set<number>();
    const re = new RegExp(`^${prefix}${pnLower}_image(\\d+)\\.webp$`);

    for (const obj of result.Contents ?? []) {
        const m = obj.Key?.match(re);
        if (m) used.add(parseInt(m[1], 10));
    }

    return used;
}

/** Return the next N available slot numbers, filling gaps from slot 1 upward */
function nextSlots(used: Set<number>, count: number): number[] {
    const slots: number[] = [];
    let n = 1;
    while (slots.length < count) {
        if (!used.has(n)) slots.push(n);
        n++;
    }
    return slots;
}

/** Generate a signed URL (1 hour) for a given S3 key */
async function signedUrl(key: string): Promise<string> {
    return getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
        { expiresIn: 3600 },
    );
}

/** Upload a WebP image + its thumbnail to S3 */
async function uploadImagePair(
    buffer: Buffer,
    key: string,
    thumbKey: string,
): Promise<void> {
    const [webp, thumb] = await Promise.all([toWebP(buffer), toThumbnail(buffer)]);

    await Promise.all([
        s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: webp,
            ContentType: 'image/webp',
        })),
        s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: thumbKey,
            Body: thumb,
            ContentType: 'image/webp',
        })),
    ]);
}

// ─── GET — list project images ───────────────────────────────────────

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectNumber = searchParams.get('projectNumber');
        if (!projectNumber) {
            return NextResponse.json({ error: 'projectNumber is required' }, { status: 400 });
        }

        const pnLower = projectNumber.toLowerCase();
        const prefix = `${pnLower}/`;

        const result = await s3Client.send(new ListObjectsV2Command({
            Bucket: S3_BUCKET,
            Prefix: prefix,
        }));

        // Only originals — skip thumbnails
        const keys = (result.Contents ?? [])
            .map((o) => o.Key!)
            .filter((k) => !k.endsWith('_thumbnail.webp'));

        let mainImage: { name: string; url: string } | null = null;
        const galleryImages: { name: string; url: string }[] = [];

        // Sort so gallery comes back in slot order (image1, image2, …)
        const sortedKeys = [...keys].sort((a, b) => {
            const numA = a.match(/_image(\d+)\.webp$/)?.[1];
            const numB = b.match(/_image(\d+)\.webp$/)?.[1];
            if (numA && numB) return parseInt(numA) - parseInt(numB);
            return a.localeCompare(b);
        });

        for (const key of sortedKeys) {
            const fileName = key.replace(prefix, '');
            const url = await signedUrl(key);

            if (fileName === `${pnLower}_main.webp`) {
                mainImage = { name: fileName, url };
            } else if (/_image\d+\.webp$/.test(fileName)) {
                galleryImages.push({ name: fileName, url });
            }
        }

        return NextResponse.json({ mainImage, galleryImages });
    } catch (err) {
        console.error('projectImages GET error:', err instanceof Error ? err.message : err);
        return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
    }
}

// ─── POST — upload image(s) ──────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { projectNumber, images } = body as {
            projectNumber: string;
            images: { name: string; data: string; type: 'main' | 'gallery' }[];
        };

        if (!projectNumber?.trim()) {
            return NextResponse.json({ error: 'projectNumber is required' }, { status: 400 });
        }
        if (!images?.length) {
            return NextResponse.json({ error: 'No images provided' }, { status: 400 });
        }

        const pnLower = projectNumber.toLowerCase();

        // Split by type
        const mainImages  = images.filter((i) => i.type === 'main');
        const galleryImgs = images.filter((i) => i.type === 'gallery');

        const uploaded: { name: string; key: string; url: string }[] = [];

        // ── Main image ──────────────────────────────────────────────
        for (const img of mainImages) {
            const buffer   = parseBase64(img.data);
            const fileName = `${pnLower}_main.webp`;
            const thumbName = `${pnLower}_main_thumbnail.webp`;
            const key      = buildKey(projectNumber, fileName);
            const thumbKey = buildKey(projectNumber, thumbName);

            await uploadImagePair(buffer, key, thumbKey);

            uploaded.push({ name: fileName, key, url: await signedUrl(key) });
        }

        // ── Gallery images — assign lowest available slot numbers ───
        if (galleryImgs.length > 0) {
            const used  = await usedGallerySlots(pnLower);
            const slots = nextSlots(used, galleryImgs.length);

            for (let i = 0; i < galleryImgs.length; i++) {
                const buffer    = parseBase64(galleryImgs[i].data);
                const slot      = slots[i];
                const fileName  = `${pnLower}_image${slot}.webp`;
                const thumbName = `${pnLower}_image${slot}_thumbnail.webp`;
                const key       = buildKey(projectNumber, fileName);
                const thumbKey  = buildKey(projectNumber, thumbName);

                await uploadImagePair(buffer, key, thumbKey);

                uploaded.push({ name: fileName, key, url: await signedUrl(key) });
            }
        }

        return NextResponse.json({ success: true, uploaded });
    } catch (err) {
        console.error('projectImages POST error:', err instanceof Error ? err.message : err);
        return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
    }
}

// ─── DELETE — remove an image + its thumbnail ────────────────────────

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { projectNumber, fileName } = body as {
            projectNumber: string;
            fileName: string;
        };

        if (!projectNumber || !fileName) {
            return NextResponse.json({ error: 'projectNumber and fileName required' }, { status: 400 });
        }

        const key = buildKey(projectNumber, fileName);

        // Derive thumbnail name:
        //   {pn}_main.webp          → {pn}_main_thumbnail.webp
        //   {pn}_imageN.webp        → {pn}_imageN_thumbnail.webp
        const thumbName = fileName.replace(/\.webp$/, '_thumbnail.webp');
        const thumbKey  = buildKey(projectNumber, thumbName);

        // Delete both in parallel; ignore 404 on the thumbnail
        await Promise.allSettled([
            s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })),
            s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: thumbKey })),
        ]);

        return NextResponse.json({ success: true, deleted: key });
    } catch (err) {
        console.error('projectImages DELETE error:', err instanceof Error ? err.message : err);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}