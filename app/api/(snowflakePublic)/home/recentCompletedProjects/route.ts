// app/api/(snowflakePublic)/home/recentCompletedProjects/awardbands.ts

import { NextResponse } from 'next/server';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { query } from '@/lib/snowflake';
import { s3Client, S3_BUCKET } from '@/lib/s3';

const DB     = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

const S_MAX_AGE              = 3600;
const STALE_WHILE_REVALIDATE = 600;

const IMG_EXT = /\.(webp|png|jpe?g|gif)$/i;

interface CompletedProjectRow {
    PROJECT_ID: number;
    PROJECT_NUMBER: string | null;
    PROJECT_NAME: string | null;
    PROJECT_STATUS: string | null;
    SUMMARY_PROJECT_DESCRIPTION: string | null;
    MODIFIED_DATE: string | null;
    PROJECT_END_DATE: string | null;
    COMMITED_FUNDING_AMT: number | null;
    PROGRAM_ADMIN_ID: number | null;
}

const ADMIN_MAP: Record<number, string> = {
    0: 'EPC',
    1: 'SCE',
    2: 'SDGE',
    3: 'PGE',
};

function formatCurrency(amt: number | null): string {
    if (!amt) return '';
    if (amt >= 1_000_000) return `$${(amt / 1_000_000).toFixed(1)}M`;
    if (amt >= 1_000)     return `$${(amt / 1_000).toFixed(0)}K`;
    return `$${amt.toLocaleString()}`;
}

function formatDate(d: string | null): string {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

async function signKey(key: string): Promise<string> {
    return getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
        { expiresIn: 3600 },
    );
}


async function resolveProjectImage(projectNumber: string | null): Promise<string | null> {
    if (!projectNumber) return null;

    const pnLower = projectNumber.toLowerCase();
    const prefix  = `${pnLower}/`;

    try {
        const res = await s3Client.send(new ListObjectsV2Command({
            Bucket: S3_BUCKET,
            Prefix: prefix,
        }));

        const allKeys = (res.Contents ?? [])
            .map(o => o.Key ?? '')
            .filter((k): k is string => !!k);

        if (allKeys.length === 0) return null;

        // Prefer the main thumbnail (small, fast)
        const thumbKey = `${prefix}${pnLower}_main_thumbnail.webp`;
        if (allKeys.includes(thumbKey)) {
            return await signKey(thumbKey);
        }

        // Fall back to the main original (any allowed extension)
        const mainRegex = new RegExp(
            `^${prefix}${pnLower}_main\\.(webp|png|jpe?g|gif)$`,
            'i',
        );
        const mainKey = allKeys.find(k => mainRegex.test(k));
        if (mainKey) return await signKey(mainKey);

        return null;
    } catch (err) {
        console.error(`[recentCompletedProjects] image resolve failed for ${projectNumber}:`, err);
        return null;
    }
}

function mapRow(r: CompletedProjectRow) {
    return {
        id:                r.PROJECT_ID,
        number:            r.PROJECT_NUMBER ?? '',
        name:              r.PROJECT_NAME ?? '',
        description:       r.SUMMARY_PROJECT_DESCRIPTION ?? '',
        amount:            formatCurrency(r.COMMITED_FUNDING_AMT),
        completionDate:    formatDate(r.PROJECT_END_DATE ?? r.MODIFIED_DATE),
        organizationShort: ADMIN_MAP[r.PROGRAM_ADMIN_ID ?? -1] ?? '',
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') ?? '3', 10)));

        const t = `${DB}.${SCHEMA}`;

        const rows = (await query(`
            SELECT
                p.PROJECT_ID,
                p.PROJECT_NUMBER,
                p.PROJECT_NAME,
                p.PROJECT_STATUS,
                p.MODIFIED_DATE,
                p.PROJECT_END_DATE,
                p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS PROGRAM_ADMIN_ID,
                pd.SUMMARY_PROJECT_DESCRIPTION,
                fd.COMMITED_FUNDING_AMT
            FROM ${t}.PROJECT p
            LEFT JOIN ${t}.PROJECT_DETAIL pd
                ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
            LEFT JOIN ${t}.FINANCE_DETAIL fd
                ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
            WHERE COALESCE(p.IS_ACTIVE, 1) = 1
              AND LOWER(TRIM(p.PROJECT_STATUS)) IN ('closed', 'complete', 'completed')
            ORDER BY COALESCE(p.PROJECT_END_DATE, p.MODIFIED_DATE) DESC NULLS LAST
            LIMIT ${limit}
        `)) as CompletedProjectRow[];

        const projects = await Promise.all(
            rows.map(async r => ({
                ...mapRow(r),
                imageUrl: await resolveProjectImage(r.PROJECT_NUMBER),
            })),
        );

        const res = NextResponse.json({
            projects,
            total: projects.length,
        });

        res.headers.set(
            'Cache-Control',
            `public, s-maxage=${S_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        );

        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Recent completed projects query error:', message);
        return NextResponse.json(
            { projects: [], total: 0 },
            { status: 500 },
        );
    }
}