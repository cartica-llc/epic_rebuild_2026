// app/api/(snowflakePublic)/(projects_insights)/spending/filters/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T } from '../../_shared';

interface PeriodRow { PERIOD_NAME: string }
interface AreaRow { INVESTMENT_AREA_NAME: string }

export async function GET() {
    try {
        const [periods, areas] = (await Promise.all([
            query(`
                SELECT PERIOD_NAME
                FROM ${T}.INVESTMENT_PROGRAM_PERIOD
                WHERE PERIOD_NAME IS NOT NULL
                ORDER BY PERIOD_NAME
            `),
            query(`
                SELECT INVESTMENT_AREA_NAME
                FROM ${T}.INVESTMENT_AREA
                WHERE IS_ACTIVE = 1 AND INVESTMENT_AREA_NAME IS NOT NULL
                ORDER BY INVESTMENT_AREA_NAME
            `),
        ])) as [PeriodRow[], AreaRow[]];

        const body = {
            periods: periods.map((r) => r.PERIOD_NAME),
            areas: areas.map((r) => r.INVESTMENT_AREA_NAME),
        };

        const res = NextResponse.json(body);
        res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return res;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[spending/filters] failed:', message);
        return NextResponse.json({ error: 'Failed to load filter options' }, { status: 500 });
    }
}
