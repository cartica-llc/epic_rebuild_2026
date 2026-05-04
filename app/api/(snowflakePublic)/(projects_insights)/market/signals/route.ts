// app/api/(snowflakePublic)/(projects_insights)/market/signals/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { toNum } from '../../_shared';
import {
    MATURITY_ORDER,
    SIGNAL_BANDS,
    MARKET_BASE_CTE,
    type MaturityStage,
    type SignalBand,
} from '../_marketShared';

interface SignalRow {
    MATURITY: string;
    SIGNAL_BAND: string;
    PROJECT_COUNT: number | null;
}

interface OverallRow {
    SIGNAL_BAND: string;
    PROJECT_COUNT: number | null;
    AVG_SCORE: number | null;
}

export async function GET() {
    try {
        const [byMaturityRows, overallRows] = await Promise.all([
            query(`
                ${MARKET_BASE_CTE}
                SELECT
                    pm.MATURITY,
                    psb.SIGNAL_BAND,
                    COUNT(*) AS PROJECT_COUNT
                FROM project_maturity pm
                INNER JOIN project_signal_band psb
                    ON pm.PROJECT_ID = psb.PROJECT_ID
                GROUP BY pm.MATURITY, psb.SIGNAL_BAND
            `) as Promise<SignalRow[]>,

            query(`
                ${MARKET_BASE_CTE}
                SELECT
                    psb.SIGNAL_BAND,
                    COUNT(*) AS PROJECT_COUNT,
                    AVG(psb.SIGNAL_SCORE) AS AVG_SCORE
                FROM project_signal_band psb
                GROUP BY psb.SIGNAL_BAND
            `) as Promise<OverallRow[]>,
        ]);

        const lookup = new Map<string, Map<string, number>>();
        for (const row of byMaturityRows) {
            if (!lookup.has(row.MATURITY)) lookup.set(row.MATURITY, new Map());
            lookup.get(row.MATURITY)!.set(row.SIGNAL_BAND, toNum(row.PROJECT_COUNT));
        }

        const byMaturity = MATURITY_ORDER.map((maturity) => {
            const bands = lookup.get(maturity);
            const strong = bands?.get('Strong') ?? 0;
            const emerging = bands?.get('Emerging') ?? 0;
            const early = bands?.get('Early') ?? 0;
            return {
                maturity: maturity as MaturityStage,
                strong,
                emerging,
                early,
                total: strong + emerging + early,
            };
        });

        const bandCounts = new Map<string, { count: number; avgScore: number }>(
            overallRows.map((r) => [
                r.SIGNAL_BAND,
                { count: toNum(r.PROJECT_COUNT), avgScore: toNum(r.AVG_SCORE) },
            ]),
        );

        const overall = SIGNAL_BANDS.map((band) => ({
            band: band as SignalBand,
            count: bandCounts.get(band)?.count ?? 0,
            avgScore: bandCounts.get(band)?.avgScore ?? 0,
        }));

        return NextResponse.json({ byMaturity, overall });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[market/signals] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}