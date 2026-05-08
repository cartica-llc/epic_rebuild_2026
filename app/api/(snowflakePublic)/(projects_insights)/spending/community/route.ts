// app/api/(snowflakePublic)/(projects_insights)/spending/community/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import {
    T,
    readInsightFilters,
    buildFilterSql,
    buildGroupingAreaFilter,
    safeQuery,
    toNum,
    applyInsightCache
} from '../../_shared';

const MIN_REQUIRED_PCT = 25;

interface OverallRow {
    TOTAL_SPENT: number | null;
    DAC_LI_SPENT: number | null;
}

interface ByPeriodRow {
    PERIOD_NAME: string | null;
    TOTAL_SPENT: number | null;
    DAC_LI_SPENT: number | null;
}

interface ByAreaRow {
    INVESTMENT_AREA_NAME: string | null;
    TOTAL_SPENT: number | null;
    DAC_LI_SPENT: number | null;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const { period, area } = readInsightFilters(url);
    const { whereClause, areaJoin } = buildFilterSql({ period, area });
    const groupingAreaFilter = buildGroupingAreaFilter(area);

    try {
        const [overallRows, byPeriodRows, byAreaRows] = await Promise.all([
            safeQuery<OverallRow[]>('community:overall', () =>
                query(`
                    SELECT
                        SUM(COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0)) AS TOTAL_SPENT,
                        SUM(CASE WHEN COALESCE(p.CPUC_DACLI, 0) = 1
                                 THEN COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0)
                                 ELSE 0 END) AS DAC_LI_SPENT
                    FROM ${T}.PROJECT p
                    LEFT JOIN ${T}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                        ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                    ${areaJoin}
                    WHERE ${whereClause}
                `) as Promise<OverallRow[]>,
            ),

            safeQuery<ByPeriodRow[]>('community:byPeriod', () =>
                query(`
                    SELECT
                        ipp.PERIOD_NAME,
                        SUM(COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0)) AS TOTAL_SPENT,
                        SUM(CASE WHEN COALESCE(p.CPUC_DACLI, 0) = 1
                                 THEN COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0)
                                 ELSE 0 END) AS DAC_LI_SPENT
                    FROM ${T}.PROJECT p
                    LEFT JOIN ${T}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                        ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                    ${areaJoin}
                    WHERE ${whereClause}
                    GROUP BY ipp.PERIOD_NAME
                    ORDER BY ipp.PERIOD_NAME
                `) as Promise<ByPeriodRow[]>,
            ),

            safeQuery<ByAreaRow[]>('community:byArea', () =>
                query(`
                    SELECT
                        ia.INVESTMENT_AREA_NAME,
                        SUM(COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0)) AS TOTAL_SPENT,
                        SUM(CASE WHEN COALESCE(p.CPUC_DACLI, 0) = 1
                                 THEN COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0)
                                 ELSE 0 END) AS DAC_LI_SPENT
                    FROM ${T}.PROJECT p
                    LEFT JOIN ${T}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                        ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                    INNER JOIN ${T}.PROJECT_HAS_INVESTMENT_AREA phia
                        ON p.PROJECT_ID = phia.PROJECT_PROJECT_ID
                    INNER JOIN ${T}.INVESTMENT_AREA ia
                        ON phia.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia.INVESTMENT_AREA_ID
                        ${groupingAreaFilter}
                    ${areaJoin}
                    WHERE ${whereClause}
                    GROUP BY ia.INVESTMENT_AREA_NAME
                    ORDER BY DAC_LI_SPENT DESC NULLS LAST
                    LIMIT 12
                `) as Promise<ByAreaRow[]>,
            ),
        ]);

        const overall = overallRows?.[0] ?? null;
        const totalSpent = toNum(overall?.TOTAL_SPENT);
        const dacLiSpent = toNum(overall?.DAC_LI_SPENT);
        const overallPct = totalSpent > 0 ? (dacLiSpent / totalSpent) * 100 : 0;

        const body = {
            overall: {
                totalSpent,
                dacLiSpent,
                dacLiPct: Math.round(overallPct * 100) / 100,
                minRequiredPct: MIN_REQUIRED_PCT,
                meetsRequirement: overallPct >= MIN_REQUIRED_PCT,
            },
            byPeriod: (byPeriodRows ?? [])
                .filter((r) => r.PERIOD_NAME !== null)
                .map((r) => {
                    const total = toNum(r.TOTAL_SPENT);
                    const dac = toNum(r.DAC_LI_SPENT);
                    return {
                        period: r.PERIOD_NAME!,
                        totalSpent: total,
                        dacLiSpent: dac,
                        dacLiPct: total > 0 ? Math.round((dac / total) * 10000) / 100 : 0,
                    };
                }),
            byArea: (byAreaRows ?? []).map((r) => {
                const total = toNum(r.TOTAL_SPENT);
                const dac = toNum(r.DAC_LI_SPENT);
                return {
                    name: r.INVESTMENT_AREA_NAME ?? 'Unknown',
                    totalSpent: total,
                    dacLiSpent: dac,
                    dacLiPct: total > 0 ? Math.round((dac / total) * 10000) / 100 : 0,
                };
            }),
        };

        return applyInsightCache(NextResponse.json(body));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[spending/community] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}