// app/api/(snowflakePublic)/(projects_insights)/learnings/filters/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T } from '../../_shared';

interface NameRow { NAME: string }
interface ProceedingRow { LABEL: string }

export async function GET() {
    try {
        const [areas, proceedings, statuses] = (await Promise.all([
            query(`
                SELECT INVESTMENT_AREA_NAME AS NAME
                FROM ${T}.INVESTMENT_AREA
                WHERE IS_ACTIVE = 1 AND INVESTMENT_AREA_NAME IS NOT NULL
                ORDER BY INVESTMENT_AREA_NAME
            `),
            query(`
                SELECT
                    CONCAT('[', CPUC_PROCEEDING_NUMBER, '] - ', CPUC_PROCEEDING_DESC) AS LABEL
                FROM ${T}.CPUC_PROCEEDING
                WHERE CPUC_PROCEEDING_NUMBER IS NOT NULL
                ORDER BY CPUC_PROCEEDING_NUMBER
            `),
            query(`
                SELECT DISTINCT PROJECT_STATUS AS NAME
                FROM ${T}.PROJECT
                WHERE PROJECT_STATUS IS NOT NULL
                ORDER BY PROJECT_STATUS
            `),
        ])) as [NameRow[], ProceedingRow[], NameRow[]];

        const body = {
            investmentAreas: areas.map((r) => r.NAME),
            cpucProceedings: proceedings.map((r) => r.LABEL),
            statuses: statuses.map((r) => r.NAME),
        };

        const res = NextResponse.json(body);
        // Cache 5 minutes — these change rarely.
        res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return res;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[learnings/filters] failed:', message);
        return NextResponse.json({ error: 'Failed to load filter options' }, { status: 500 });
    }
}
