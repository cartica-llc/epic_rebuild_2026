// app/api/(snowflakePublic)/projectDetailPageRoutes/[id]/financeHistory/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T, safeInt, safeQuery } from '../../_shared';

export interface PublicFinanceQuarter {
    source: 'current' | 'history';
    reportingYear: number;
    reportingQuarter: number;      // 1–4
    committedFunding: number | null;
    encumberedFunding: number | null;
    expendedToDate: number | null;
    adminOverhead: number | null;
    matchFunding: number | null;
    contractAmount: number | null;
    leveragedFunds: number | null;
    matchFundingSplit: number | null;   // ratio 0–1
    numOfBidders: number | null;
    rankOfSelectedBidders: number | null;
    bidderDescription: string | null;
}

const num = (v: unknown): number | null => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string | null => {
    if (v == null) return null;
    const s = String(v).trim();
    return s.length > 0 ? s : null;
};

function mapRow(r: Record<string, unknown>, source: 'current' | 'history'): PublicFinanceQuarter | null {
    const year = num(r.REPORTING_YEAR);
    const quarter = num(r.REPORTING_QUARTER);
    if (year == null || quarter == null) return null;   // unstamped legacy row — nothing to plot
    return {
        source,
        reportingYear: year,
        reportingQuarter: quarter,
        committedFunding: num(r.COMMITED_FUNDING_AMT),
        encumberedFunding: num(r.ENCUMBERED_FUNDING_AMT),
        expendedToDate: num(r.FUNDS_EXPENDED_TO_DATE),
        adminOverhead: num(r.ADMIN_AND_OVERHEAD_COST),
        matchFunding: num(r.MATCH_FUNDING),
        contractAmount: num(r.CONTRACT_AMOUNT),
        leveragedFunds: num(r.LEVERAGED_FUNDS),
        matchFundingSplit: num(r.MATCH_FUNDING_SPLIT),
        numOfBidders: num(r.NUM_OF_BIDDERS),
        rankOfSelectedBidders: num(r.RANK_OF_SELECTED_BIDDERS),
        bidderDescription: str(r.BIDDER_DESCRIPTION),
    };
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const pid = safeInt(id);
        if (pid == null) {
            return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
        }

        const projectRows = await safeQuery(
            'financeHistory:project',
            () => query(`
                SELECT FINANCE_DETAIL_FINANCE_DETAIL_ID AS FD_ID
                FROM ${T}.PROJECT
                WHERE PROJECT_ID = ${pid}
            `) as Promise<{ FD_ID: number | null }[]>,
            [],
        );

        if (projectRows.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const fdId = projectRows[0].FD_ID != null ? Number(projectRows[0].FD_ID) : null;
        if (fdId == null) {
            return NextResponse.json({ quarters: [] });
        }

        const [currentRows, historyRows] = await Promise.all([
            safeQuery(
                'financeHistory:current',
                () => query(`
                    SELECT REPORTING_YEAR, REPORTING_QUARTER, COMMITED_FUNDING_AMT,
                           ENCUMBERED_FUNDING_AMT, FUNDS_EXPENDED_TO_DATE,
                           ADMIN_AND_OVERHEAD_COST, MATCH_FUNDING, CONTRACT_AMOUNT,
                           LEVERAGED_FUNDS, MATCH_FUNDING_SPLIT, NUM_OF_BIDDERS,
                           RANK_OF_SELECTED_BIDDERS, BIDDER_DESCRIPTION
                    FROM ${T}.FINANCE_DETAIL WHERE FINANCE_DETAIL_ID = ${fdId}
                `) as Promise<Record<string, unknown>[]>,
                [],
            ),
            safeQuery(
                'financeHistory:history',
                // NOTE: bidder fields intentionally NOT selected here — they
                // live only on FINANCE_DETAIL (current), and may not exist
                // as columns on FINANCE_DETAIL_HISTORY. Bidder info doesn't
                // change quarter to quarter anyway, so the current row is
                // the only one that needs it (see mapRow / BiddingSection).
                () => query(`
                    SELECT REPORTING_YEAR, REPORTING_QUARTER, COMMITED_FUNDING_AMT,
                           ENCUMBERED_FUNDING_AMT, FUNDS_EXPENDED_TO_DATE,
                           ADMIN_AND_OVERHEAD_COST, MATCH_FUNDING, CONTRACT_AMOUNT,
                           LEVERAGED_FUNDS, MATCH_FUNDING_SPLIT
                    FROM ${T}.FINANCE_DETAIL_HISTORY
                    WHERE FINANCE_DETAIL_ID = ${fdId}
                `) as Promise<Record<string, unknown>[]>,
                [],
            ),
        ]);

        const quarters = [
            ...currentRows.map((r) => mapRow(r, 'current')),
            ...historyRows.map((r) => mapRow(r, 'history')),
        ]
            .filter((q): q is PublicFinanceQuarter => q !== null)
            // Oldest first — chart-ready
            .sort((a, b) =>
                (a.reportingYear * 4 + a.reportingQuarter) - (b.reportingYear * 4 + b.reportingQuarter));

        const res = NextResponse.json({ quarters });
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return res;
    } catch (err: unknown) {
        console.error('financeHistory GET error:', err instanceof Error ? err.message : err);
        return NextResponse.json({ error: 'Failed to load finance history' }, { status: 500 });
    }
}