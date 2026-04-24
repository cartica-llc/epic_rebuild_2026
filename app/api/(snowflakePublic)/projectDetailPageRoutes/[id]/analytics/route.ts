// app/api/(snowflakePublic)/projectDetailPageRoutes/[id]/analytics/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T, safeInt, safeQuery } from '../../_shared';
import type { AnalyticsContext } from '@/components/project_detail_page/types';

interface TotalsRow {
    COMMITTED: number | null;
    CONTRACTED: number | null;
    EXPENDED: number | null;
    CNT: number | null;
}

interface AreaAggRow {
    AREA: string | null;
    COMMITTED: number | null;
    CNT: number | null;
}

interface DacAggRow {
    AREA: string | null;
    DAC_C: number | null;
    TOT_C: number | null;
    DAC_N: number | null;
    TOT_N: number | null;
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
        const [tot, agg, dac] = await Promise.all([
            safeQuery(
                'analytics:totals',
                async () => {
                    const rows = (await query(`
                        SELECT
                            SUM(fd.COMMITED_FUNDING_AMT) AS COMMITTED,
                            SUM(fd.CONTRACT_AMOUNT) AS CONTRACTED,
                            SUM(fd.FUNDS_EXPENDED_TO_DATE) AS EXPENDED,
                            COUNT(DISTINCT p.PROJECT_ID) AS CNT
                        FROM ${T}.PROJECT p
                        LEFT JOIN ${T}.FINANCE_DETAIL fd
                            ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                        WHERE COALESCE(p.IS_ACTIVE, 1) = 1
                    `)) as TotalsRow[];
                    const r = rows[0];
                    return {
                        committed: Number(r?.COMMITTED ?? 0),
                        contracted: Number(r?.CONTRACTED ?? 0),
                        expended: Number(r?.EXPENDED ?? 0),
                        count: Number(r?.CNT ?? 0),
                    };
                },
                { committed: 0, contracted: 0, expended: 0, count: 0 }
            ),

            safeQuery(
                'analytics:areaAgg',
                async () => {
                    const rows = (await query(`
                        SELECT
                            ia.INVESTMENT_AREA_NAME AS AREA,
                            SUM(fd.COMMITED_FUNDING_AMT) AS COMMITTED,
                            COUNT(DISTINCT p.PROJECT_ID) AS CNT
                        FROM ${T}.PROJECT p
                        JOIN ${T}.PROJECT_HAS_INVESTMENT_AREA pia
                            ON pia.PROJECT_PROJECT_ID = p.PROJECT_ID
                        JOIN ${T}.INVESTMENT_AREA ia
                            ON ia.INVESTMENT_AREA_ID = pia.INVESTMENT_AREA_INVESTMENT_AREA_ID
                        LEFT JOIN ${T}.FINANCE_DETAIL fd
                            ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                        WHERE COALESCE(p.IS_ACTIVE, 1) = 1
                        GROUP BY ia.INVESTMENT_AREA_NAME
                    `)) as AreaAggRow[];
                    const out: Record<string, { committed: number; count: number }> = {};
                    for (const r of rows) {
                        if (!r.AREA) continue;
                        out[r.AREA] = {
                            committed: Number(r.COMMITTED ?? 0),
                            count: Number(r.CNT ?? 0),
                        };
                    }
                    return out;
                },
                {} as Record<string, { committed: number; count: number }>
            ),

            safeQuery(
                'analytics:dac',
                async () => {
                    // Using CPUC_DACLI convenience column (= 1 when DAC OR LI).
                    const rows = (await query(`
                        WITH project_areas AS (
                            SELECT DISTINCT ia.INVESTMENT_AREA_NAME AS AREA
                            FROM ${T}.PROJECT_HAS_INVESTMENT_AREA pia
                            JOIN ${T}.INVESTMENT_AREA ia
                                ON ia.INVESTMENT_AREA_ID = pia.INVESTMENT_AREA_INVESTMENT_AREA_ID
                            WHERE pia.PROJECT_PROJECT_ID = ${id}
                        )
                        SELECT
                            ia.INVESTMENT_AREA_NAME AS AREA,
                            SUM(CASE WHEN COALESCE(p.CPUC_DACLI, 0) = 1
                                     THEN fd.COMMITED_FUNDING_AMT ELSE 0 END) AS DAC_C,
                            SUM(fd.COMMITED_FUNDING_AMT) AS TOT_C,
                            COUNT(DISTINCT CASE WHEN COALESCE(p.CPUC_DACLI, 0) = 1
                                                THEN p.PROJECT_ID END) AS DAC_N,
                            COUNT(DISTINCT p.PROJECT_ID) AS TOT_N
                        FROM ${T}.PROJECT p
                        JOIN ${T}.PROJECT_HAS_INVESTMENT_AREA pia
                            ON pia.PROJECT_PROJECT_ID = p.PROJECT_ID
                        JOIN ${T}.INVESTMENT_AREA ia
                            ON ia.INVESTMENT_AREA_ID = pia.INVESTMENT_AREA_INVESTMENT_AREA_ID
                        LEFT JOIN ${T}.FINANCE_DETAIL fd
                            ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                        WHERE ia.INVESTMENT_AREA_NAME IN (SELECT AREA FROM project_areas)
                            AND COALESCE(p.IS_ACTIVE, 1) = 1
                        GROUP BY ia.INVESTMENT_AREA_NAME
                    `)) as DacAggRow[];
                    const out: Record<
                        string,
                        { dacC: number; totC: number; dacN: number; totN: number }
                    > = {};
                    for (const r of rows) {
                        if (!r.AREA) continue;
                        out[r.AREA] = {
                            dacC: Number(r.DAC_C ?? 0),
                            totC: Number(r.TOT_C ?? 0),
                            dacN: Number(r.DAC_N ?? 0),
                            totN: Number(r.TOT_N ?? 0),
                        };
                    }
                    return out;
                },
                {} as Record<
                    string,
                    { dacC: number; totC: number; dacN: number; totN: number }
                >
            ),
        ]);

        const ctx: AnalyticsContext = {
            tot,
            agg,
            dac,
            commercialization: null,
            maturityCounts: {},
            sameStageSignalCounts: { strong: 0, emerging: 0, early: 0, total: 0 },
        };

        return NextResponse.json(ctx);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[projectDetailPageRoutes/analytics] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}
