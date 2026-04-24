// app/api/(snowflakePublic)/projectDetailPageRoutes/[id]/core/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T, safeInt, toBool, toIso } from '../../_shared';
import type { ProjectCore } from '@/components/project_detail_page/types';

interface CoreRow {
    PROJECT_ID: number;
    PROJECT_NAME: string | null;
    PROJECT_NUMBER: string | null;
    PROJECT_STATUS: string | null;
    PERIOD_NAME: string | null;
    PROJECT_START_DATE: Date | string | null;
    PROJECT_END_DATE: Date | string | null;
    PROJECT_TYPE_NAME: string | null;
    COMPANY_NAME: string | null;
    CREATE_DATE: Date | string | null;
    MODIFIED_DATE: Date | string | null;
    PROGRAM_ADMIN_ID: number | null;
    COMMITED_FUNDING_AMT: number | null;
    CONTRACT_AMOUNT: number | null;
    FUNDS_EXPENDED_TO_DATE: number | null;
    ENCUMBERED_FUNDING_AMT: number | null;
    MATCH_FUNDING: number | null;
    LEVERAGED_FUNDS: number | null;
    CPUC_DAC: boolean | number | null;
    CPUC_LI: boolean | number | null;
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
                p.PROJECT_ID,
                p.PROJECT_NAME,
                p.PROJECT_NUMBER,
                p.PROJECT_STATUS,
                ipp.PERIOD_NAME,
                p.PROJECT_START_DATE,
                p.PROJECT_END_DATE,
                pt.PROJECT_TYPE_NAME,
                c.COMPANY_NAME,
                p.CREATE_DATE,
                p.MODIFIED_DATE,
                p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS PROGRAM_ADMIN_ID,
                fd.COMMITED_FUNDING_AMT,
                fd.CONTRACT_AMOUNT,
                fd.FUNDS_EXPENDED_TO_DATE,
                fd.ENCUMBERED_FUNDING_AMT,
                fd.MATCH_FUNDING,
                fd.LEVERAGED_FUNDS,
                p.CPUC_DAC,
                p.CPUC_LI
            FROM ${T}.PROJECT p
            LEFT JOIN ${T}.FINANCE_DETAIL fd
                ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
            LEFT JOIN ${T}.PROJECT_TYPE pt
                ON p.PROJECT_TYPE_PROJECT_TYPE_ID = pt.PROJECT_TYPE_ID
            LEFT JOIN ${T}.COMPANY c
                ON p.PROJECT_LEAD_COMPANY_ID = c.COMPANY_ID
            LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
            WHERE p.PROJECT_ID = ${id}
            LIMIT 1
        `)) as CoreRow[];

        if (!rows.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const r = rows[0];

        const core: ProjectCore = {
            id: r.PROJECT_ID,
            projectName: r.PROJECT_NAME,
            projectNumber: r.PROJECT_NUMBER,
            projectStatus: r.PROJECT_STATUS,
            investmentProgramPeriod: r.PERIOD_NAME,
            projectStartDate: toIso(r.PROJECT_START_DATE),
            projectEndDate: toIso(r.PROJECT_END_DATE),
            projectType: r.PROJECT_TYPE_NAME,
            leadCompany: r.COMPANY_NAME,
            createdDate: toIso(r.CREATE_DATE),
            modifiedDate: toIso(r.MODIFIED_DATE),
            programAdminId: r.PROGRAM_ADMIN_ID,
            committedFundingAmt: r.COMMITED_FUNDING_AMT,
            contractAmount: r.CONTRACT_AMOUNT,
            expendedToDate: r.FUNDS_EXPENDED_TO_DATE,
            encumberedFundingAmount: r.ENCUMBERED_FUNDING_AMT,
            matchFunding: r.MATCH_FUNDING,
            leveragedFunds: r.LEVERAGED_FUNDS,
            cpucDac: toBool(r.CPUC_DAC),
            cpucLi: toBool(r.CPUC_LI),

            mainImageUrl: null,
            mainThumbnailUrl: null,

            maturityStage: null,
        };

        return NextResponse.json(core);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[projectDetailPageRoutes/core] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}