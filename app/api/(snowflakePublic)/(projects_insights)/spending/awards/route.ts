// app/api/(snowflakePublic)/(projects_insights)/spending/awards/awardbands.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import {
    T,
    readInsightFilters,
    buildFilterSql,
    safeQuery,
    toNum,
    applyInsightCache,
} from '../../_shared';
import { AWARD_BANDS } from '@/components/projects_page/insights/spending/shared/awardbands';

interface BandRow {
    BAND: string | null;
    BAND_ORDER: number | null;
    PROJECT_COUNT: number | null;
    AMOUNT: number | null;
}

interface SummaryRow {
    PROJECT_COUNT: number | null;
    AVG_AMOUNT: number | null;
    MEDIAN_AMOUNT: number | null;
    MIN_AMOUNT: number | null;
    MAX_AMOUNT: number | null;
}

const AMOUNT_COL = 'fd.COMMITED_FUNDING_AMT';

// Build CASE expressions from the shared band definitions so the SQL
// stays in lockstep with the URL-building helper on the client.
function buildBandLabelCase(): string {
    const whens = AWARD_BANDS
        .filter((b) => b.max !== null)
        .map((b) => `WHEN amount < ${b.max} THEN '${b.label.replace(/'/g, "''")}'`)
        .join('\n                            ');
    const elseBand = AWARD_BANDS.find((b) => b.max === null);
    return `CASE
                            ${whens}
                            ELSE '${elseBand?.label.replace(/'/g, "''") ?? 'Unknown'}'
                        END`;
}

function buildBandOrderCase(): string {
    const whens = AWARD_BANDS
        .filter((b) => b.max !== null)
        .map((b) => `WHEN amount < ${b.max} THEN ${b.order}`)
        .join('\n                            ');
    const elseBand = AWARD_BANDS.find((b) => b.max === null);
    return `CASE
                            ${whens}
                            ELSE ${elseBand?.order ?? 0}
                        END`;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const { period, area } = readInsightFilters(url);
    const { whereClause, areaJoin } = buildFilterSql({ period, area });

    try {
        console.log(
            `[spending/awards] querying Snowflake | period=${period ?? 'all'} | area=${area ?? 'all'} | ${new Date().toISOString()}`
        );

        const [bandRows, summaryRows] = await Promise.all([
            safeQuery<BandRow[]>('awards:bands', () =>
                query(`
                    WITH banded AS (
                        SELECT
                            p.PROJECT_ID,
                            COALESCE(${AMOUNT_COL}, 0) AS amount
                        FROM ${T}.PROJECT p
                        LEFT JOIN ${T}.FINANCE_DETAIL fd
                            ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                        LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                            ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                        ${areaJoin}
                        WHERE ${whereClause}
                    )
                    SELECT
                        ${buildBandLabelCase()} AS BAND,
                        ${buildBandOrderCase()} AS BAND_ORDER,
                        COUNT(*) AS PROJECT_COUNT,
                        SUM(amount) AS AMOUNT
                    FROM banded
                    WHERE amount > 0
                    GROUP BY 1, 2
                    ORDER BY BAND_ORDER
                `) as Promise<BandRow[]>,
            ),

            safeQuery<SummaryRow[]>('awards:summary', () =>
                query(`
                    WITH amounts AS (
                        SELECT COALESCE(${AMOUNT_COL}, 0) AS amount
                        FROM ${T}.PROJECT p
                        LEFT JOIN ${T}.FINANCE_DETAIL fd
                            ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                        LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                            ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
                        ${areaJoin}
                        WHERE ${whereClause}
                    )
                    SELECT
                        COUNT(*) AS PROJECT_COUNT,
                        AVG(NULLIF(amount, 0)) AS AVG_AMOUNT,
                        MEDIAN(NULLIF(amount, 0)) AS MEDIAN_AMOUNT,
                        MIN(NULLIF(amount, 0)) AS MIN_AMOUNT,
                        MAX(amount) AS MAX_AMOUNT
                    FROM amounts
                `) as Promise<SummaryRow[]>,
            ),
        ]);

        const summary = summaryRows?.[0] ?? null;

        const body = {
            summary: {
                projectCount: toNum(summary?.PROJECT_COUNT),
                average: toNum(summary?.AVG_AMOUNT),
                median: toNum(summary?.MEDIAN_AMOUNT),
                min: toNum(summary?.MIN_AMOUNT),
                max: toNum(summary?.MAX_AMOUNT),
            },
            bands: (bandRows ?? []).map((r) => ({
                band: r.BAND ?? 'Unknown',
                order: toNum(r.BAND_ORDER),
                projectCount: toNum(r.PROJECT_COUNT),
                amount: toNum(r.AMOUNT),
            })),
        };

        return applyInsightCache(NextResponse.json(body));

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[spending/awards] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}