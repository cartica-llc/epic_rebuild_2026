// app/api/(snowflakePublic)/(projects_insights)/map/filters/awardbands.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T } from '../../_shared';

interface AreaRow { NAME: string }

export async function GET() {
    try {
        const areas = (await query(`
            SELECT INVESTMENT_AREA_NAME AS NAME
            FROM ${T}.INVESTMENT_AREA
            WHERE IS_ACTIVE = 1 AND INVESTMENT_AREA_NAME IS NOT NULL
            ORDER BY INVESTMENT_AREA_NAME
        `)) as AreaRow[];

        const body = {
            investmentAreas: areas.map((r) => r.NAME),
        };

        const res = NextResponse.json(body);
        res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return res;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[map/filters] failed:', message);
        return NextResponse.json({ error: 'Failed to load filter options' }, { status: 500 });
    }
}