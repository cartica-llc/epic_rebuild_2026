// app/api/(snowflakePublic)/(projects_insights)/spending/overview/route.ts

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

interface TotalsRow {
    COMMITTED: number | null;
    CONTRACTED: number | null;
    EXPENDED: number | null;
    PROJECT_COUNT: number | null;
}

interface ByAreaRow {
    INVESTMENT_AREA_NAME: string | null;
    COMMITTED: number | null;
    CONTRACTED: number | null;
    EXPENDED: number | null;
}

interface ByPeriodRow {
    PERIOD_NAME: string | null;
    COMMITTED: number | null;
    CONTRACTED: number | null;
    EXPENDED: number | null;
}

interface TopLeadRow {
    COMPANY_NAME: string | null;
    COMMITTED: number | null;
    CONTRACTED: number | null;
    EXPENDED: number | null;
    PROJECT_COUNT: number | null;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const { period, area } = readInsightFilters(url);
    const { whereClause, areaJoin } = buildFilterSql({ period, area });
    const groupingAreaFilter = buildGroupingAreaFilter(area);

    try {
        const [totalsRows, byAreaRows, byPeriodRows, topLeadsRows] = await Promise.all([
            safeQuery<TotalsRow[]>('overview:totals', () =>
                query(`
                    SELECT
                        SUM(COALESCE(fd.COMMITED_FUNDING_AMT, 0))      AS COMMITTED,
                        SUM(COALESCE(fd.CONTRACT_AMOUNT, 0))           AS CONTRACTED,
                        SUM(COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0))    AS EXPENDED,
                        COUNT(DISTINCT p.PROJECT_ID)                   AS PROJECT_COUNT
                    FROM ${T}.PROJECT p
                    LEFT JOIN ${T}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                        ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                    ${areaJoin}
                    WHERE ${whereClause}
                `) as Promise<TotalsRow[]>,
            ),

            safeQuery<ByAreaRow[]>('overview:byArea', () =>
                query(`
                    SELECT
                        ia.INVESTMENT_AREA_NAME,
                        SUM(COALESCE(fd.COMMITED_FUNDING_AMT, 0))      AS COMMITTED,
                        SUM(COALESCE(fd.CONTRACT_AMOUNT, 0))           AS CONTRACTED,
                        SUM(COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0))    AS EXPENDED
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
                    ORDER BY COMMITTED DESC NULLS LAST
                    LIMIT 15
                `) as Promise<ByAreaRow[]>,
            ),

            safeQuery<ByPeriodRow[]>('overview:byPeriod', () =>
                query(`
                    SELECT
                        ipp.PERIOD_NAME,
                        SUM(COALESCE(fd.COMMITED_FUNDING_AMT, 0))      AS COMMITTED,
                        SUM(COALESCE(fd.CONTRACT_AMOUNT, 0))           AS CONTRACTED,
                        SUM(COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0))    AS EXPENDED
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

            safeQuery<TopLeadRow[]>('overview:topLeads', () =>
                query(`
                    SELECT
                        c.COMPANY_NAME,
                        SUM(COALESCE(fd.COMMITED_FUNDING_AMT, 0))      AS COMMITTED,
                        SUM(COALESCE(fd.CONTRACT_AMOUNT, 0))           AS CONTRACTED,
                        SUM(COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0))    AS EXPENDED,
                        COUNT(DISTINCT p.PROJECT_ID)                   AS PROJECT_COUNT
                    FROM ${T}.PROJECT p
                    LEFT JOIN ${T}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    LEFT JOIN ${T}.COMPANY c
                        ON p.PROJECT_LEAD_COMPANY_ID = c.COMPANY_ID
                    LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                        ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                    ${areaJoin}
                    WHERE ${whereClause} AND c.COMPANY_NAME IS NOT NULL
                    GROUP BY c.COMPANY_NAME
                    ORDER BY COMMITTED DESC NULLS LAST
                    LIMIT 10
                `) as Promise<TopLeadRow[]>,
            ),
        ]);

        const totalsRow = totalsRows?.[0] ?? null;

        const body = {
            totals: {
                committed: toNum(totalsRow?.COMMITTED),
                contracted: toNum(totalsRow?.CONTRACTED),
                expended: toNum(totalsRow?.EXPENDED),
                projectCount: toNum(totalsRow?.PROJECT_COUNT),
            },
            byArea: (byAreaRows ?? []).map((r) => ({
                name: r.INVESTMENT_AREA_NAME ?? 'Unknown',
                committed: toNum(r.COMMITTED),
                contracted: toNum(r.CONTRACTED),
                expended: toNum(r.EXPENDED),
            })),
            byPeriod: (byPeriodRows ?? [])
                .filter((r) => r.PERIOD_NAME !== null)
                .map((r) => ({
                    period: r.PERIOD_NAME!,
                    committed: toNum(r.COMMITTED),
                    contracted: toNum(r.CONTRACTED),
                    expended: toNum(r.EXPENDED),
                })),
            topLeads: (topLeadsRows ?? []).map((r) => ({
                name: r.COMPANY_NAME ?? 'Unknown',
                committed: toNum(r.COMMITTED),
                contracted: toNum(r.CONTRACTED),
                expended: toNum(r.EXPENDED),
                projectCount: toNum(r.PROJECT_COUNT),
            })),
        };

        return NextResponse.json(body);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[spending/overview] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}