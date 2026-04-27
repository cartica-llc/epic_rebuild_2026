// app/api/projectsList/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';

const DB       = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA   = process.env.DEV_SNOWFLAKE_SCHEMA;
const DT_TABLE = process.env.DEV_SNOWFLAKE_DT_PROJECTS_LIST;

interface ProjectRow {
    PROJECT_ID: number;
    PROJECT_NUMBER: string | null;
    PROJECT_NAME: string | null;
    PROJECT_STATUS: string | null;
    COMPANY_NAME: string | null;
    COMMITED_FUNDING_AMT: number | null;
    INVESTMENT_AREAS: string | null;
    PROGRAM_ADMIN_ID: number | null;
    PERSON_CONTACT_FIRST_NAME: string | null;
    PERSON_CONTACT_LAST_NAME: string | null;
    INVESTMENT_PROGRAM_PERIOD_PERIOD_ID: number | null;
}

interface CountRow {
    TOTAL: number;
}

const ADMIN_MAP: Record<number, string> = {
    0: 'EPC',
    1: 'SCE',
    2: 'SDGE',
    3: 'PGE',
};

function safeStr(v: string) {
    return v.replace(/'/g, "''");
}
function safeInt(v: string) {
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
}
function safeFloat(v: string) {
    const n = parseFloat(v.replace(/[$,]/g, ''));
    return isNaN(n) ? null : n;
}


function buildWhere(sp: URLSearchParams): string {
    const wheres: string[] = [];

    const inactiveFilter = sp.get('inactiveFilter')?.trim() ?? '';
    const inactiveScope  = sp.get('inactiveScope')?.trim()  ?? null;

    const orgToAdminId: Record<string, number> = {
        epc: 0, cec: 0, sce: 1, sdge: 2, sdg: 2, pge: 3, 'pg&e': 3,
    };

    if (inactiveFilter === 'all') {
        if (inactiveScope) {
            const scopedId = orgToAdminId[inactiveScope.toLowerCase()];
            if (scopedId !== undefined) wheres.push(`PROGRAM_ADMIN_ID = ${scopedId}`);
        }
    } else if (inactiveFilter === 'inactive_only') {
        wheres.push('IS_ACTIVE = 0');
        if (inactiveScope) {
            const scopedId = orgToAdminId[inactiveScope.toLowerCase()];
            if (scopedId !== undefined) wheres.push(`PROGRAM_ADMIN_ID = ${scopedId}`);
        }
    } else {
        wheres.push('IS_ACTIVE = 1');
    }

    // ── Text search ──
    const search = sp.get('search')?.trim();
    if (search) {
        const s = safeStr(search);
        wheres.push(`(
            LOWER(PROJECT_NAME) LIKE LOWER('%${s}%')
            OR LOWER(PROJECT_NUMBER) LIKE LOWER('%${s}%')
            OR LOWER(COMPANY_NAME) LIKE LOWER('%${s}%')
            OR LOWER(PERSON_CONTACT_FIRST_NAME) LIKE LOWER('%${s}%')
            OR LOWER(PERSON_CONTACT_LAST_NAME) LIKE LOWER('%${s}%')
        )`);
    }

    // ── Scalar column filters ──
    const projectTypeId = safeInt(sp.get('projectTypeId') ?? '');
    if (projectTypeId !== null) wheres.push(`PROJECT_TYPE_PROJECT_TYPE_ID = ${projectTypeId}`);

    const status = sp.get('status')?.trim();
    if (status) wheres.push(`LOWER(PROJECT_STATUS) = LOWER('${safeStr(status)}')`);

    const programAdminId = safeInt(sp.get('programAdminId') ?? '');
    if (programAdminId !== null) wheres.push(`PROGRAM_ADMIN_ID = ${programAdminId}`);

    const investmentPeriodId = safeInt(sp.get('investmentPeriodId') ?? '');
    if (investmentPeriodId !== null) wheres.push(`INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ${investmentPeriodId}`);

    const assemblyDistrictId = safeInt(sp.get('assemblyDistrictId') ?? '');
    if (assemblyDistrictId !== null) {
        wheres.push(`LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID = ${assemblyDistrictId}`);
    }

    const senateDistrictId = safeInt(sp.get('senateDistrictId') ?? '');
    if (senateDistrictId !== null) {
        wheres.push(`LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID = ${senateDistrictId}`);
    }

    if (sp.get('disadvantaged')    === '1') wheres.push(`CPUC_DAC = 1`);
    if (sp.get('lowIncome')         === '1') wheres.push(`CPUC_LI = 1`);
    if (sp.get('communityBenefits') === '1') wheres.push(`COMMUNITY_BENEFITS = 1`);

    // ── Funding range ──
    const contractMin = safeFloat(sp.get('contractMin') ?? '');
    if (contractMin !== null) wheres.push(`COMMITED_FUNDING_AMT >= ${contractMin}`);

    const contractMax = safeFloat(sp.get('contractMax') ?? '');
    if (contractMax !== null) wheres.push(`COMMITED_FUNDING_AMT <= ${contractMax}`);

    // ── Array filters (ARRAY_CONTAINS on pre-aggregated DT columns) ──
    // ARRAY_CONTAINS(value::variant, array_column) — no junction table hits.

    const investmentAreaId = safeInt(sp.get('investmentAreaId') ?? '');
    if (investmentAreaId !== null) {
        wheres.push(`ARRAY_CONTAINS(${investmentAreaId}::variant, INVESTMENT_AREA_IDS)`);
    }

    const developmentStageId = safeInt(sp.get('developmentStageId') ?? '');
    if (developmentStageId !== null) {
        wheres.push(`ARRAY_CONTAINS(${developmentStageId}::variant, DEVELOPMENT_STAGE_IDS)`);
    }

    const cpucProceedingId = safeInt(sp.get('cpucProceedingId') ?? '');
    if (cpucProceedingId !== null) {
        wheres.push(`ARRAY_CONTAINS(${cpucProceedingId}::variant, CPUC_PROCEEDING_IDS)`);
    }

    const businessClassId = safeInt(sp.get('businessClassId') ?? '');
    if (businessClassId !== null) {
        wheres.push(`ARRAY_CONTAINS(${businessClassId}::variant, BUSINESS_CLASS_IDS)`);
    }

    const utilityServiceId = safeInt(sp.get('utilityServiceId') ?? '');
    if (utilityServiceId !== null) {
        wheres.push(`ARRAY_CONTAINS(${utilityServiceId}::variant, UTILITY_SERVICE_IDS)`);
    }

    return wheres.length > 0 ? wheres.join('\n            AND ') : '1=1';
}

function mapRow(r: ProjectRow) {
    return {
        id:                r.PROJECT_ID,
        code:              r.PROJECT_NUMBER ?? '',
        name:              r.PROJECT_NAME   ?? '',
        location:          '',
        organizationShort: ADMIN_MAP[r.PROGRAM_ADMIN_ID ?? -1] ?? '',
        investmentArea:    r.INVESTMENT_AREAS ?? '',
        status:            r.PROJECT_STATUS  ?? '',
        committed:         r.COMMITED_FUNDING_AMT
            ? `$${r.COMMITED_FUNDING_AMT.toLocaleString()}`
            : '',
        projectLead:       r.COMPANY_NAME ?? '',
        imageKey:          r.PROJECT_NUMBER
            ? `${r.PROJECT_NUMBER.toLowerCase()}/${r.PROJECT_NUMBER.toLowerCase()}_main`
            : '',
        programAdminId:    r.PROGRAM_ADMIN_ID,
        INVESTMENT_PROGRAM_PERIOD_PERIOD_ID: r.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID,
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1',   10));
        const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '100', 10)));
        const offset = (page - 1) * limit;

        const dt          = `${DB}.${SCHEMA}.${DT_TABLE}`;
        const whereClause = buildWhere(searchParams);

        const [rows, countRows] = (await Promise.all([
            query(`
                SELECT
                    PROJECT_ID,
                    PROJECT_NUMBER,
                    PROJECT_NAME,
                    PROJECT_STATUS,
                    PROGRAM_ADMIN_ID,
                    PERSON_CONTACT_FIRST_NAME,
                    PERSON_CONTACT_LAST_NAME,
                    INVESTMENT_PROGRAM_PERIOD_PERIOD_ID,
                    COMPANY_NAME,
                    COMMITED_FUNDING_AMT,
                    INVESTMENT_AREAS
                FROM ${dt}
                WHERE ${whereClause}
                ORDER BY PROJECT_ID DESC
                LIMIT ${limit} OFFSET ${offset}
            `),
            query(`
                SELECT COUNT(*) AS TOTAL
                FROM ${dt}
                WHERE ${whereClause}
            `),
        ])) as [ProjectRow[], CountRow[]];

        const total = countRows[0]?.TOTAL ?? 0;

        return NextResponse.json({
            projects:   rows.map(mapRow),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Snowflake query error:', message);
        return NextResponse.json(
            { projects: [], total: 0, page: 1, limit: 100, totalPages: 0 },
            { status: 500 },
        );
    }
}