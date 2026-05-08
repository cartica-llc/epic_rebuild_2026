// app/api/(snowflakePublic)/home/recentUpdatedProjectsMap/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';

const DB     = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

const S_MAX_AGE              = 3600;
const STALE_WHILE_REVALIDATE = 600;

interface UpdatedProjectRow {
    PROJECT_ID: number;
    PROJECT_NUMBER: string | null;
    PROJECT_NAME: string | null;
    PROJECT_STATUS: string | null;
    SUMMARY_PROJECT_DESCRIPTION: string | null;
    MODIFIED_DATE: string | null;
    COMMITED_FUNDING_AMT: number | null;
    PROGRAM_ADMIN_ID: number | null;
    CITY: string | null;
    STATE: string | null;
    LATITUDE_Y: number | null;
    LONGITUDE_X: number | null;
}

const ADMIN_MAP: Record<number, string> = {
    0: 'EPC',
    1: 'SCE',
    2: 'SDGE',
    3: 'PGE',
};

function formatFunding(amt: number | null): string {
    if (!amt) return '';
    if (amt >= 1_000_000_000) return `$${(amt / 1_000_000_000).toFixed(1)}B`;
    if (amt >= 1_000_000)     return `$${(amt / 1_000_000).toFixed(1)}M`;
    if (amt >= 1_000)         return `$${(amt / 1_000).toFixed(0)}K`;
    return `$${amt.toLocaleString()}`;
}

function formatLocation(city: string | null, state: string | null): string {
    const parts = [city, state].filter(Boolean);
    return parts.join(', ');
}

function mapRow(r: UpdatedProjectRow) {
    return {
        id:                r.PROJECT_ID,
        number:            r.PROJECT_NUMBER ?? '',
        name:              r.PROJECT_NAME ?? '',
        description:       r.SUMMARY_PROJECT_DESCRIPTION ?? '',
        funding:           formatFunding(r.COMMITED_FUNDING_AMT),
        location:          formatLocation(r.CITY, r.STATE),
        organizationShort: ADMIN_MAP[r.PROGRAM_ADMIN_ID ?? -1] ?? '',
        coordinates:       r.LONGITUDE_X !== null && r.LATITUDE_Y !== null
            ? [Number(r.LONGITUDE_X), Number(r.LATITUDE_Y)] as [number, number]
            : null,
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') ?? '4', 10)));

        const t = `${DB}.${SCHEMA}`;

        const rows = (await query(`
            WITH project_address AS (
                SELECT
                    pha.PROJECT_PROJECT_ID,
                    a.CITY,
                    a.STATE,
                    a.LATITUDE_Y,
                    a.LONGITUDE_X,
                    ROW_NUMBER() OVER (
                        PARTITION BY pha.PROJECT_PROJECT_ID
                        ORDER BY
                            CASE WHEN a.LATITUDE_Y IS NOT NULL AND a.LONGITUDE_X IS NOT NULL THEN 0 ELSE 1 END,
                            a.ADDRESS_ID
                    ) AS rn
                FROM ${t}.PROJECT_HAS_ADDRESS pha
                LEFT JOIN ${t}.ADDRESS a
                    ON pha.ADDRESS_ADDRESS_ID = a.ADDRESS_ID
                WHERE COALESCE(pha.IS_ACTIVE, 1) = 1
            )
            SELECT
                p.PROJECT_ID,
                p.PROJECT_NUMBER,
                p.PROJECT_NAME,
                p.PROJECT_STATUS,
                p.MODIFIED_DATE,
                p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS PROGRAM_ADMIN_ID,
                pd.SUMMARY_PROJECT_DESCRIPTION,
                fd.COMMITED_FUNDING_AMT,
                pa.CITY,
                pa.STATE,
                pa.LATITUDE_Y,
                pa.LONGITUDE_X
            FROM ${t}.PROJECT p
            LEFT JOIN ${t}.PROJECT_DETAIL pd
                ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
            LEFT JOIN ${t}.FINANCE_DETAIL fd
                ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
            LEFT JOIN project_address pa
                ON pa.PROJECT_PROJECT_ID = p.PROJECT_ID AND pa.rn = 1
            WHERE COALESCE(p.IS_ACTIVE, 1) = 1
              AND LOWER(TRIM(COALESCE(p.PROJECT_STATUS, ''))) NOT IN ('closed', 'complete', 'completed')
              AND pa.LATITUDE_Y IS NOT NULL
              AND pa.LONGITUDE_X IS NOT NULL
            ORDER BY p.MODIFIED_DATE DESC NULLS LAST
            LIMIT ${limit}
        `)) as UpdatedProjectRow[];

        const res = NextResponse.json({
            projects: rows.map(mapRow),
            total:    rows.length,
        });

        res.headers.set(
            'Cache-Control',
            `public, s-maxage=${S_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        );

        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Recent updated projects map query error:', message);
        return NextResponse.json(
            { projects: [], total: 0 },
            { status: 500 },
        );
    }
}