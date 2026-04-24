// app/api/(snowflakePublic)/projectDetailPageRoutes/[id]/images/route.ts
//
// Public variant of /api/(snowflakeUser)/projectImages — reads the same S3
// layout but requires no auth. Accepts any image extension for main/gallery
// originals (legacy projects used PNG/JPG before the WebP convention).
//
// File layout on S3:
//   {pn}/{pn}_main.(webp|png|jpg|jpeg)
//   {pn}/{pn}_main_thumbnail.webp
//   {pn}/{pn}_image1.(webp|png|jpg|jpeg)
//   {pn}/{pn}_image1_thumbnail.webp
//   ...

import { NextResponse } from 'next/server';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '@/lib/s3';
import { query } from '@/lib/snowflake';
import { T, safeInt, safeQuery } from '../../_shared';
import type {
    GalleryImage,
    ProjectImages,
} from '@/components/project_detail_page/types';

interface NumberRow {
    PROJECT_NUMBER: string | null;
}

// Allowed image extensions (case-insensitive). WebP is preferred but legacy
// projects have PNG/JPG originals that still need to render.
const IMG_EXT = /\.(webp|png|jpe?g|gif)$/i;

async function signKey(key: string): Promise<string> {
    return getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
        { expiresIn: 3600 }
    );
}

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
    const { id: idParam } = await params;
    const id = safeInt(idParam);
    if (id === null) {
        return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
    }

    try {
        const numRows = (await query(`
            SELECT PROJECT_NUMBER
            FROM ${T}.PROJECT
            WHERE PROJECT_ID = ${id}
            LIMIT 1
        `)) as NumberRow[];

        const projectNumber = numRows[0]?.PROJECT_NUMBER ?? null;
        if (!projectNumber) {
            const empty: ProjectImages = {
                main: null,
                mainThumbnail: null,
                gallery: [],
            };
            return NextResponse.json(empty);
        }

        const pnLower = projectNumber.toLowerCase();
        const prefix = `${pnLower}/`;

        const payload = await safeQuery(
            'images:list',
            async () => {
                const res = await s3Client.send(
                    new ListObjectsV2Command({
                        Bucket: S3_BUCKET,
                        Prefix: prefix,
                    })
                );
                const allKeys = (res.Contents ?? [])
                    .map((o) => o.Key ?? '')
                    .filter((k): k is string => !!k);

                // Thumbnails are always *_thumbnail.webp — separate them out.
                const thumbKeys = new Set(
                    allKeys.filter((k) => /_thumbnail\.webp$/i.test(k))
                );
                const originalKeys = allKeys.filter(
                    (k) => !thumbKeys.has(k) && IMG_EXT.test(k)
                );

                // Main original — any extension, match `{pn}_main.*`
                const mainRegex = new RegExp(
                    `^${prefix}${pnLower}_main\\.(webp|png|jpe?g|gif)$`,
                    'i'
                );
                const mainKey = originalKeys.find((k) => mainRegex.test(k));

                // Gallery originals — any extension, match `{pn}_imageN.*`
                const galleryRegex = new RegExp(
                    `^${prefix}${pnLower}_image(\\d+)\\.(webp|png|jpe?g|gif)$`,
                    'i'
                );
                const galleryKeys = originalKeys
                    .map((k) => {
                        const m = k.match(galleryRegex);
                        return m ? { key: k, slot: Number(m[1]) } : null;
                    })
                    .filter((x): x is { key: string; slot: number } => x !== null)
                    .sort((a, b) => a.slot - b.slot)
                    .map((x) => x.key);

                // Sign main + its thumbnail (thumbnail always *.webp regardless
                // of original extension)
                let main: string | null = null;
                let mainThumbnail: string | null = null;
                if (mainKey) {
                    const mainThumbKey = `${prefix}${pnLower}_main_thumbnail.webp`;
                    const [mu, mtu] = await Promise.all([
                        signKey(mainKey),
                        thumbKeys.has(mainThumbKey)
                            ? signKey(mainThumbKey)
                            : Promise.resolve(null),
                    ]);
                    main = mu;
                    mainThumbnail = mtu;
                }

                // Sign gallery + matching thumbnails
                const gallery: GalleryImage[] = await Promise.all(
                    galleryKeys.map(async (key) => {
                        // Thumbnail: strip extension, append _thumbnail.webp
                        const thumbKey = key.replace(
                            IMG_EXT,
                            '_thumbnail.webp'
                        );
                        const [url, thumbnailUrl] = await Promise.all([
                            signKey(key),
                            thumbKeys.has(thumbKey)
                                ? signKey(thumbKey)
                                : Promise.resolve(null),
                        ]);
                        return { url, thumbnailUrl, caption: null };
                    })
                );

                const out: ProjectImages = { main, mainThumbnail, gallery };
                return out;
            },
            { main: null, mainThumbnail: null, gallery: [] } as ProjectImages
        );

        return NextResponse.json(payload);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[projectDetailPageRoutes/images] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}
