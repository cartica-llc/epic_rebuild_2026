// app/api/(snowflakePublic)/projectDetailPageRoutes/[id]/finance/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T, safeInt, safeQuery } from '../../_shared';
import type { FinanceDetails } from '@/components/project_detail_page/types';

interface FinanceRow {
    FINANCE_DETAIL_ID: number | null;
    COMMITED_FUNDING_AMT: number | null;
    CONTRACT_AMOUNT: number | null;
    ENCUMBERED_FUNDING_AMT: number | null;
    FUNDS_EXPENDED_TO_DATE: number | null;
    ADMIN_AND_OVERHEAD_COST: number | null;
    MATCH_FUNDING: number | null;
    MATCH_FUNDING_SPLIT: number | null;
    LEVERAGED_FUNDS: number | null;
}

interface NameRow {
    NAME: string | null;
}

interface CpucRow {
    CPUC_NUMBER: string | null;
    CPUC_DESCRIPTION: string | null;
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
        const rows = (await query(`
            SELECT
                fd.FINANCE_DETAIL_ID,
                fd.COMMITED_FUNDING_AMT,
                fd.CONTRACT_AMOUNT,
                fd.ENCUMBERED_FUNDING_AMT,
                fd.FUNDS_EXPENDED_TO_DATE,
                fd.ADMIN_AND_OVERHEAD_COST,
                fd.MATCH_FUNDING,
                fd.MATCH_FUNDING_SPLIT,
                fd.LEVERAGED_FUNDS
            FROM ${T}.PROJECT p
            LEFT JOIN ${T}.FINANCE_DETAIL fd
                ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
            WHERE p.PROJECT_ID = ${id}
            LIMIT 1
        `)) as FinanceRow[];

        const r = rows[0];
        const financeDetailId = r?.FINANCE_DETAIL_ID ?? null;

        // CPUC_PROCEEDING columns: verified by the list route query in projectsList
        // (LISTAGG of cp.CPUC_PROCEEDING_NUMBER). Description column name assumed.
        const [fundingMechanisms, matchFundingPartners, cpucProceedings] =
            await Promise.all([
                safeQuery(
                    'finance:fundingMechanisms',
                    async () => {
                        if (financeDetailId === null) return [] as string[];
                        const j = (await query(`
                            SELECT fm.FUNDING_MECHANISM_NAME AS NAME
                            FROM ${T}.FINANCE_DETAIL_HAS_FUNDING_MECHANISM fhfm
                            JOIN ${T}.FUNDING_MECHANISM fm
                                ON fm.FUNDING_MECHANISM_ID = fhfm.FUNDING_MECHANISM_FUNDING_MECHANISM_ID
                            WHERE fhfm.FINANCE_DETAIL_FINANCE_DETAIL_ID = ${financeDetailId}
                        `)) as NameRow[];
                        return j.map((x) => x.NAME).filter((x): x is string => !!x);
                    },
                    [] as string[]
                ),
                safeQuery(
                    'finance:matchFundingPartners',
                    async () => {
                        if (financeDetailId === null) return [] as string[];
                        // Correct table: FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER
                        const j = (await query(`
                            SELECT c.COMPANY_NAME AS NAME
                            FROM ${T}.FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER fhmfp
                            JOIN ${T}.COMPANY c
                                ON c.COMPANY_ID = fhmfp.COMPANY_COMPANY_ID
                            WHERE fhmfp.FINANCE_DETAIL_FINANCE_DETAIL_ID = ${financeDetailId}
                        `)) as NameRow[];
                        return j.map((x) => x.NAME).filter((x): x is string => !!x);
                    },
                    [] as string[]
                ),
                safeQuery(
                    'finance:cpucProceedings',
                    async () => {
                        const j = (await query(`
                            SELECT
                                cp.CPUC_PROCEEDING_NUMBER AS CPUC_NUMBER,
                                cp.CPUC_PROCEEDING_DESCRIPTION AS CPUC_DESCRIPTION
                            FROM ${T}.PROJECT_HAS_CPUC_PROCEEDING phcp
                            JOIN ${T}.CPUC_PROCEEDING cp
                                ON cp.CPUC_PROCEEDING_ID = phcp.CPUC_PROCEEDING_CPUC_PROCEEDING_ID
                            WHERE phcp.PROJECT_PROJECT_ID = ${id}
                        `)) as CpucRow[];
                        return j
                            .filter((x) => !!x.CPUC_NUMBER)
                            .map((x) => ({
                                cpucNumber: x.CPUC_NUMBER as string,
                                cpucDescription: x.CPUC_DESCRIPTION,
                            }));
                    },
                    [] as { cpucNumber: string; cpucDescription: string | null }[]
                ),
            ]);

        const finance: FinanceDetails = {
            commitedFundingAmt: r?.COMMITED_FUNDING_AMT ?? null,
            contractAmount: r?.CONTRACT_AMOUNT ?? null,
            encumberedFundingAmount: r?.ENCUMBERED_FUNDING_AMT ?? null,
            expendedToDate: r?.FUNDS_EXPENDED_TO_DATE ?? null,
            adminCost: r?.ADMIN_AND_OVERHEAD_COST ?? null,
            matchFunding: r?.MATCH_FUNDING ?? null,
            matchFundingSplit: r?.MATCH_FUNDING_SPLIT ?? null,
            leveragedFunds: r?.LEVERAGED_FUNDS ?? null,
            // LEVERAGED_FUNDS_SOURCES doesn't exist as a column in FINANCE_DETAIL.
            leveragedFundsSources: null,
            fundingMechanisms,
            matchFundingPartners,
            cpucProceedings,
        };

        return NextResponse.json(finance);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[projectDetailPageRoutes/finance] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}
