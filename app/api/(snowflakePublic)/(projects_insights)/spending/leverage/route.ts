// app/api/(snowflakePublic)/(projects_insights)/spending/leverage/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import {
    T,
    readInsightFilters,
    buildFilterSql,
    buildGroupingAreaFilter,
    safeQuery,
    toNum,
} from '../../_shared';

interface LeverageTotalsRow {
    MATCH_TOTAL: number | null;
    LEVERAGED_TOTAL: number | null;
    CONTRACT_TOTAL: number | null;
    AVG_SPLIT: number | null;
    PROJECT_COUNT: number | null;
}

interface LeverageByPeriodRow {
    PERIOD_NAME: string | null;
    MATCH_AMOUNT: number | null;
    LEVERAGED_AMOUNT: number | null;
    CONTRACT_AMOUNT: number | null;
}

interface LeverageByAreaRow {
    INVESTMENT_AREA_NAME: string | null;
    MATCH_AMOUNT: number | null;
    LEVERAGED_AMOUNT: number | null;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const { period, area } = readInsightFilters(url);
    const { whereClause, areaJoin } = buildFilterSql({ period, area });
    const groupingAreaFilter = buildGroupingAreaFilter(area);

    try {
        const [totalsRows, byPeriodRows, byAreaRows] = await Promise.all([
            safeQuery<LeverageTotalsRow[]>('leverage:totals', () =>
                query(`
                    SELECT
                        SUM(COALESCE(fd.MATCH_FUNDING, 0))      AS MATCH_TOTAL,
                        SUM(COALESCE(fd.LEVERAGED_FUNDS, 0))    AS LEVERAGED_TOTAL,
                        SUM(COALESCE(fd.CONTRACT_AMOUNT, 0))    AS CONTRACT_TOTAL,
                        AVG(NULLIF(fd.MATCH_FUNDING_SPLIT, 0))  AS AVG_SPLIT,
                        COUNT(DISTINCT p.PROJECT_ID)            AS PROJECT_COUNT
                    FROM ${T}.PROJECT p
                    LEFT JOIN ${T}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                        ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                    ${areaJoin}
                    WHERE ${whereClause}
                `) as Promise<LeverageTotalsRow[]>,
            ),

            safeQuery<LeverageByPeriodRow[]>('leverage:byPeriod', () =>
                query(`
                    SELECT
                        ipp.PERIOD_NAME,
                        SUM(COALESCE(fd.MATCH_FUNDING, 0))      AS MATCH_AMOUNT,
                        SUM(COALESCE(fd.LEVERAGED_FUNDS, 0))    AS LEVERAGED_AMOUNT,
                        SUM(COALESCE(fd.CONTRACT_AMOUNT, 0))    AS CONTRACT_AMOUNT
                    FROM ${T}.PROJECT p
                    LEFT JOIN ${T}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                        ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                    ${areaJoin}
                    WHERE ${whereClause}
                    GROUP BY ipp.PERIOD_NAME
                    ORDER BY ipp.PERIOD_NAME
                `) as Promise<LeverageByPeriodRow[]>,
            ),

            safeQuery<LeverageByAreaRow[]>('leverage:byArea', () =>
                query(`
                    SELECT
                        ia.INVESTMENT_AREA_NAME,
                        SUM(COALESCE(fd.MATCH_FUNDING, 0))      AS MATCH_AMOUNT,
                        SUM(COALESCE(fd.LEVERAGED_FUNDS, 0))    AS LEVERAGED_AMOUNT
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
                    ORDER BY (MATCH_AMOUNT + LEVERAGED_AMOUNT) DESC NULLS LAST
                    LIMIT 12
                `) as Promise<LeverageByAreaRow[]>,
            ),
        ]);

        const totalsRow = totalsRows?.[0] ?? null;
        const matchTotal = toNum(totalsRow?.MATCH_TOTAL);
        const leveragedTotal = toNum(totalsRow?.LEVERAGED_TOTAL);
        const contractTotal = toNum(totalsRow?.CONTRACT_TOTAL);

        const body = {
            totals: {
                matchFunding: matchTotal,
                leveragedFunds: leveragedTotal,
                contractAmount: contractTotal,
                averageMatchSplit: toNum(totalsRow?.AVG_SPLIT),
                ratio:
                    contractTotal > 0
                        ? (matchTotal + leveragedTotal) / contractTotal
                        : 0,
                projectCount: toNum(totalsRow?.PROJECT_COUNT),
            },
            byPeriod: (byPeriodRows ?? [])
                .filter((r) => r.PERIOD_NAME !== null)
                .map((r) => ({
                    period: r.PERIOD_NAME!,
                    match: toNum(r.MATCH_AMOUNT),
                    leveraged: toNum(r.LEVERAGED_AMOUNT),
                    contract: toNum(r.CONTRACT_AMOUNT),
                })),
            byArea: (byAreaRows ?? []).map((r) => ({
                name: r.INVESTMENT_AREA_NAME ?? 'Unknown',
                match: toNum(r.MATCH_AMOUNT),
                leveraged: toNum(r.LEVERAGED_AMOUNT),
            })),
        };

        return NextResponse.json(body);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[spending/leverage] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}