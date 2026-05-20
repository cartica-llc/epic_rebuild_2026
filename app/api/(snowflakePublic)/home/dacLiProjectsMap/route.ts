// app/api/(snowflakePublic)/home/dacLiProjectsMap/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { query } from '@/lib/snowflake';

const DB     = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

const S_MAX_AGE              = 3600;
const STALE_WHILE_REVALIDATE = 600;
const CACHE_TTL_SECONDS      = 600;

export const REGION_META: Record<number, { label: string; short: string; color: string }> = {
    3: { label: 'Northern California',  short: 'NorCal',   color: '#0d9488' },
    0: { label: 'Central California',   short: 'Central',  color: '#d97706' },
    1: { label: 'Southern California',  short: 'SoCal',    color: '#7c3aed' },
    2: { label: 'San Diego',            short: 'San Diego', color: '#e11d48' },
};

interface ProjectRow {
    PROJECT_ID: number;
    PROJECT_NUMBER: string | null;
    PROJECT_NAME: string | null;
    PROJECT_STATUS: string | null;
    SUMMARY_PROJECT_DESCRIPTION: string | null;
    COMMITED_FUNDING_AMT: number | null;
    FUNDS_EXPENDED_TO_DATE: number | null;
    PROGRAM_ADMIN_ID: number | null;
    CITY: string | null;
    STATE: string | null;
    LATITUDE_Y: number | null;
    LONGITUDE_X: number | null;
    REGION_RANK: number;
    REGION_TOTAL_EXPENDED: number;
    REGION_DAC_EXPENDED: number;
    REGION_DAC_PCT: number;
    REGION_DAC_PROJECT_COUNT: number;
}

interface GlobalStatsRow {
    TOTAL_SPENT: number;
    DAC_LI_SPENT: number;
    DAC_LI_SPENT_PCT: number;
}

function formatFunding(amt: number | null): string {
    if (!amt) return '';
    if (amt >= 1_000_000_000) return `$${(amt / 1_000_000_000).toFixed(1)}B`;
    if (amt >= 1_000_000)     return `$${(amt / 1_000_000).toFixed(1)}M`;
    if (amt >= 1_000)         return `$${(amt / 1_000).toFixed(0)}K`;
    return `$${amt.toLocaleString()}`;
}

function formatLocation(city: string | null, state: string | null): string {
    return [city, state].filter(Boolean).join(', ');
}

const getDacLiProjectsMapData = unstable_cache(
    async () => {
        const t = `${DB}.${SCHEMA}`;

        const [rawProjectRows, rawGlobalRows] = await Promise.all([
            query(`
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
                    LEFT JOIN ${t}.ADDRESS a ON pha.ADDRESS_ADDRESS_ID = a.ADDRESS_ID
                    WHERE COALESCE(pha.IS_ACTIVE, 1) = 1
                ),
                region_stats AS (
                    SELECT
                        p2.PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS ADMIN_ID,
                        SUM(COALESCE(fd2.FUNDS_EXPENDED_TO_DATE, 0)) AS REGION_TOTAL_EXPENDED,
                        SUM(CASE WHEN COALESCE(p2.CPUC_DACLI, 0) = 1 THEN COALESCE(fd2.FUNDS_EXPENDED_TO_DATE, 0) ELSE 0 END) AS REGION_DAC_EXPENDED,
                        ROUND(
                            100.0 * SUM(CASE WHEN COALESCE(p2.CPUC_DACLI, 0) = 1 THEN COALESCE(fd2.FUNDS_EXPENDED_TO_DATE, 0) ELSE 0 END)
                            / NULLIF(SUM(COALESCE(fd2.FUNDS_EXPENDED_TO_DATE, 0)), 0),
                            2
                        ) AS REGION_DAC_PCT,
                        COUNT(CASE WHEN COALESCE(p2.CPUC_DACLI, 0) = 1 THEN 1 END) AS REGION_DAC_PROJECT_COUNT
                    FROM ${t}.PROJECT p2
                    LEFT JOIN ${t}.FINANCE_DETAIL fd2
                        ON p2.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd2.FINANCE_DETAIL_ID
                    WHERE COALESCE(p2.IS_ACTIVE, 1) = 1
                      AND p2.PROGRAM_ADMIN_PROGRAM_ADMIN_ID IN (0, 1, 2, 3)
                    GROUP BY p2.PROGRAM_ADMIN_PROGRAM_ADMIN_ID
                ),
                ranked_dac AS (
                    SELECT
                        p.PROJECT_ID,
                        p.PROJECT_NUMBER,
                        p.PROJECT_NAME,
                        p.PROJECT_STATUS,
                        p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS PROGRAM_ADMIN_ID,
                        pd.SUMMARY_PROJECT_DESCRIPTION,
                        fd.COMMITED_FUNDING_AMT,
                        fd.FUNDS_EXPENDED_TO_DATE,
                        pa.CITY,
                        pa.STATE,
                        pa.LATITUDE_Y,
                        pa.LONGITUDE_X,
                        rs.REGION_TOTAL_EXPENDED,
                        rs.REGION_DAC_EXPENDED,
                        rs.REGION_DAC_PCT,
                        rs.REGION_DAC_PROJECT_COUNT,
                        ROW_NUMBER() OVER (
                            PARTITION BY p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID
                            ORDER BY COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0) DESC NULLS LAST
                        ) AS REGION_RANK
                    FROM ${t}.PROJECT p
                    LEFT JOIN ${t}.PROJECT_DETAIL pd
                        ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
                    LEFT JOIN ${t}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    LEFT JOIN project_address pa
                        ON pa.PROJECT_PROJECT_ID = p.PROJECT_ID AND pa.rn = 1
                    LEFT JOIN region_stats rs
                        ON rs.ADMIN_ID = p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID
                    WHERE COALESCE(p.IS_ACTIVE, 1) = 1
                      AND COALESCE(p.CPUC_DACLI, 0) = 1
                      AND p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID IN (0, 1, 2, 3)
                      AND pa.LATITUDE_Y IS NOT NULL
                      AND pa.LONGITUDE_X IS NOT NULL
                )
                SELECT * FROM ranked_dac
                WHERE REGION_RANK <= 3
                ORDER BY PROGRAM_ADMIN_ID, REGION_RANK
            `),

            query(`
                WITH base AS (
                    SELECT
                        COALESCE(p.CPUC_DACLI, 0) AS CPUC_DACLI,
                        COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0) AS amount_spent
                    FROM ${t}.PROJECT p
                    LEFT JOIN ${t}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    WHERE COALESCE(p.IS_ACTIVE, 1) = 1
                )
                SELECT
                    SUM(amount_spent) AS TOTAL_SPENT,
                    SUM(CASE WHEN CPUC_DACLI = 1 THEN amount_spent ELSE 0 END) AS DAC_LI_SPENT,
                    ROUND(
                        100.0 * SUM(CASE WHEN CPUC_DACLI = 1 THEN amount_spent ELSE 0 END)
                        / NULLIF(SUM(amount_spent), 0),
                        2
                    ) AS DAC_LI_SPENT_PCT
                FROM base
            `),
        ]);

        const projectRows = rawProjectRows as unknown as ProjectRow[];
        const globalRows  = rawGlobalRows  as unknown as GlobalStatsRow[];

        const globalStats = globalRows[0] ?? { TOTAL_SPENT: 0, DAC_LI_SPENT: 0, DAC_LI_SPENT_PCT: 0 };

        const regionMap: Record<number, {
            adminId: number;
            label: string;
            short: string;
            color: string;
            dacPct: number;
            dacExpended: string;
            totalExpended: string;
            projectCount: number;
            projects: Array<{
                id: number;
                number: string;
                name: string;
                description: string;
                funding: string;
                expended: string;
                location: string;
                rank: number;
                coordinates: [number, number];
            }>;
        }> = {};

        for (const r of projectRows) {
            const adminId = r.PROGRAM_ADMIN_ID ?? -1;
            const meta = REGION_META[adminId];
            if (!meta) continue;

            if (!regionMap[adminId]) {
                regionMap[adminId] = {
                    adminId,
                    label:         meta.label,
                    short:         meta.short,
                    color:         meta.color,
                    dacPct:        r.REGION_DAC_PCT ?? 0,
                    dacExpended:   formatFunding(r.REGION_DAC_EXPENDED),
                    totalExpended: formatFunding(r.REGION_TOTAL_EXPENDED),
                    projectCount:  r.REGION_DAC_PROJECT_COUNT ?? 0,
                    projects:      [],
                };
            }

            regionMap[adminId].projects.push({
                id:          r.PROJECT_ID,
                number:      r.PROJECT_NUMBER ?? '',
                name:        r.PROJECT_NAME ?? '',
                description: r.SUMMARY_PROJECT_DESCRIPTION ?? '',
                funding:     formatFunding(r.COMMITED_FUNDING_AMT),
                expended:    formatFunding(r.FUNDS_EXPENDED_TO_DATE),
                location:    formatLocation(r.CITY, r.STATE),
                rank:        r.REGION_RANK,
                coordinates: [Number(r.LONGITUDE_X), Number(r.LATITUDE_Y)],
            });
        }

        const regions = Object.values(regionMap).sort((a, b) => a.adminId - b.adminId);

        return {
            globalStats: {
                totalSpent:   formatFunding(globalStats.TOTAL_SPENT),
                dacLiSpent:   formatFunding(globalStats.DAC_LI_SPENT),
                dacLiPct:     globalStats.DAC_LI_SPENT_PCT,
                minimumPct:   25,
                meetingReq:   globalStats.DAC_LI_SPENT_PCT >= 25,
            },
            regions,
        };
    },
    ['home:dacLiProjectsMap'],
    {
        revalidate: CACHE_TTL_SECONDS,
        tags: ['home-data', 'home:dacLiProjectsMap'],
    },
);

export async function GET() {
    try {
        const payload = await getDacLiProjectsMapData();

        const res = NextResponse.json(payload);
        res.headers.set(
            'Cache-Control',
            `public, s-maxage=${S_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        );
        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('DAC/LI projects map query error:', message);
        return NextResponse.json({ globalStats: null, regions: [] }, { status: 500 });
    }
}