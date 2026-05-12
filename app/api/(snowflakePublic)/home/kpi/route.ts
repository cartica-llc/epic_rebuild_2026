// app/api/(snowflakePublic)/home/kpi/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';

const DB     = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

const S_MAX_AGE              = 180;
const STALE_WHILE_REVALIDATE = 60;

interface KPIRow {
    ACTIVE_PROJECTS:    number | null;
    TOTAL_FUNDING:      number | null;
    TOTAL_MATCH:        number | null;
    TOTAL_EXPENDED:     number | null;
}

export async function GET() {
    try {
        const t = `${DB}.${SCHEMA}`;

        const [row] = (await query(`
            SELECT
                COUNT(DISTINCT p.PROJECT_ID)                        AS ACTIVE_PROJECTS,
                SUM(COALESCE(fd.COMMITED_FUNDING_AMT, 0))           AS TOTAL_FUNDING,
                SUM(COALESCE(fd.MATCH_FUNDING, 0))                  AS TOTAL_MATCH,
                SUM(COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0))         AS TOTAL_EXPENDED
            FROM ${t}.PROJECT p
            LEFT JOIN ${t}.FINANCE_DETAIL fd
                ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
            WHERE COALESCE(p.IS_ACTIVE, 1) = 1
        `)) as KPIRow[];

        const activeProjects = Number(row.ACTIVE_PROJECTS ?? 0);
        const funding        = Number(row.TOTAL_FUNDING   ?? 0);
        const matchFunding   = Number(row.TOTAL_MATCH     ?? 0);
        const expended       = Number(row.TOTAL_EXPENDED  ?? 0);

        const res = NextResponse.json({
            activeProjects,
            funding,
            matchFunding,
            expended,
            fundingChangePct:      null,
            matchFundingChangePct: null,
        });

        res.headers.set(
            'Cache-Control',
            `public, s-maxage=${S_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        );

        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[KPI route] Snowflake error:', message);
        return NextResponse.json(
            { activeProjects: 0, funding: 0, matchFunding: 0, expended: 0, fundingChangePct: null, matchFundingChangePct: null },
            { status: 500 },
        );
    }
}