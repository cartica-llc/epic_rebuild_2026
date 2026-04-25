// app/api/projectsList/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

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

// ─── Dynamic query builder ────────────────────────────────────────────

function buildQuery(sp: URLSearchParams) {
    const t = `${DB}.${SCHEMA}`;
    const joins: string[] = [];
    const wheres: string[] = [];

    // ── IS_ACTIVE scoping ──
    // inactiveFilter: admin-only param.
    //   ''              → published only  (IS_ACTIVE = 1, default for all users)
    //   'all'           → all projects    (no IS_ACTIVE filter)
    //   'inactive_only' → unpublished only (IS_ACTIVE = 0)
    // inactiveScope: org string (e.g. 'sce') sent by ProgramAdmins — restricts
    //   inactive results to their PROGRAM_ADMIN_PROGRAM_ADMIN_ID. MasterAdmins
    //   send no scope and see all orgs.
    const inactiveFilter = sp.get('inactiveFilter')?.trim() ?? '';
    const inactiveScope = sp.get('inactiveScope')?.trim() ?? null;

    if (inactiveFilter === 'all') {
        // No IS_ACTIVE filter — return every project regardless of visibility
        if (inactiveScope) {
            const orgToAdminId: Record<string, number> = { epc: 0, cec: 0, sce: 1, sdge: 2, sdg: 2, pge: 3, 'pg&e': 3 };
            const scopedId = orgToAdminId[inactiveScope.toLowerCase()];
            if (scopedId !== undefined) wheres.push(`p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID = ${scopedId}`);
        }
    } else if (inactiveFilter === 'inactive_only') {
        wheres.push('COALESCE(p.IS_ACTIVE, 1) = 0');
        if (inactiveScope) {
            const orgToAdminId: Record<string, number> = { epc: 0, cec: 0, sce: 1, sdge: 2, sdg: 2, pge: 3, 'pg&e': 3 };
            const scopedId = orgToAdminId[inactiveScope.toLowerCase()];
            if (scopedId !== undefined) wheres.push(`p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID = ${scopedId}`);
        }
    } else {
        // Default: published only
        wheres.push('COALESCE(p.IS_ACTIVE, 1) = 1');
    }

    // Always needed for display columns
    joins.push(`LEFT JOIN ${t}.COMPANY c ON p.PROJECT_LEAD_COMPANY_ID = c.COMPANY_ID`);
    joins.push(`LEFT JOIN ${t}.FINANCE_DETAIL fd ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID`);
    joins.push(`LEFT JOIN ${t}.PROJECT_HAS_INVESTMENT_AREA pia ON p.PROJECT_ID = pia.PROJECT_PROJECT_ID`);
    joins.push(`LEFT JOIN ${t}.INVESTMENT_AREA ia ON pia.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia.INVESTMENT_AREA_ID`);

    // ── Text search ──
    const search = sp.get('search')?.trim();
    if (search) {
        const s = safeStr(search);
        wheres.push(`(
            LOWER(p.PROJECT_NAME) LIKE LOWER('%${s}%')
            OR LOWER(p.PROJECT_NUMBER) LIKE LOWER('%${s}%')
            OR LOWER(c.COMPANY_NAME) LIKE LOWER('%${s}%')
            OR LOWER(p.PERSON_CONTACT_FIRST_NAME) LIKE LOWER('%${s}%')
            OR LOWER(p.PERSON_CONTACT_LAST_NAME) LIKE LOWER('%${s}%')
        )`);
    }

    // ── Direct FK filters on PROJECT ──

    const projectTypeId = safeInt(sp.get('projectTypeId') ?? '');
    if (projectTypeId !== null) wheres.push(`p.PROJECT_TYPE_PROJECT_TYPE_ID = ${projectTypeId}`);

    const status = sp.get('status')?.trim();
    if (status) wheres.push(`LOWER(p.PROJECT_STATUS) = LOWER('${safeStr(status)}')`);

    const programAdminId = safeInt(sp.get('programAdminId') ?? '');
    if (programAdminId !== null) wheres.push(`p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID = ${programAdminId}`);

    const investmentPeriodId = safeInt(sp.get('investmentPeriodId') ?? '');
    if (investmentPeriodId !== null) wheres.push(`p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ${investmentPeriodId}`);

    const assemblyDistrictId = safeInt(sp.get('assemblyDistrictId') ?? '');
    if (assemblyDistrictId !== null) {
        wheres.push(`p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID = ${assemblyDistrictId}`);
    }

    const senateDistrictId = safeInt(sp.get('senateDistrictId') ?? '');
    if (senateDistrictId !== null) {
        wheres.push(`p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID = ${senateDistrictId}`);
    }

    if (sp.get('disadvantaged') === '1') wheres.push(`p.CPUC_DAC = 1`);
    if (sp.get('lowIncome') === '1') wheres.push(`p.CPUC_LI = 1`);
    if (sp.get('communityBenefits') === '1') wheres.push(`p.COMMUNITY_BENEFITS = 1`);

    // ── Funding range ──

    const contractMin = safeFloat(sp.get('contractMin') ?? '');
    if (contractMin !== null) wheres.push(`fd.COMMITED_FUNDING_AMT >= ${contractMin}`);

    const contractMax = safeFloat(sp.get('contractMax') ?? '');
    if (contractMax !== null) wheres.push(`fd.COMMITED_FUNDING_AMT <= ${contractMax}`);

    // ── Investment area ──

    const investmentAreaId = safeInt(sp.get('investmentAreaId') ?? '');
    if (investmentAreaId !== null) wheres.push(`pia.INVESTMENT_AREA_INVESTMENT_AREA_ID = ${investmentAreaId}`);

    // ── Junction table filters: EXISTS subqueries ──

    const developmentStageId = safeInt(sp.get('developmentStageId') ?? '');
    if (developmentStageId !== null) {
        wheres.push(`EXISTS (
            SELECT 1 FROM ${t}.PROJECT_HAS_DEVELOPMENT_STAGE x
            WHERE x.PROJECT_PROJECT_ID = p.PROJECT_ID
              AND x.DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID = ${developmentStageId}
        )`);
    }

    const cpucProceedingId = safeInt(sp.get('cpucProceedingId') ?? '');
    if (cpucProceedingId !== null) {
        wheres.push(`EXISTS (
            SELECT 1 FROM ${t}.PROJECT_HAS_CPUC_PROCEEDING x
            WHERE x.PROJECT_PROJECT_ID = p.PROJECT_ID
              AND x.CPUC_PROCEEDING_CPUC_PROCEEDING_ID = ${cpucProceedingId}
        )`);
    }

    const businessClassId = safeInt(sp.get('businessClassId') ?? '');
    if (businessClassId !== null) {
        wheres.push(`EXISTS (
            SELECT 1 FROM ${t}.PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION x
            WHERE x.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID
              AND x.BUSINESS_CLASSIFICATION_BUSINESS_CLASSIFICATION_ID = ${businessClassId}
        )`);
    }

    const utilityServiceId = safeInt(sp.get('utilityServiceId') ?? '');
    if (utilityServiceId !== null) {
        wheres.push(`EXISTS (
            SELECT 1 FROM ${t}.PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA x
            WHERE x.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID
              AND x.UTILITY_SERVICE_AREA_UTILITY_SERVICE_AREA_ID = ${utilityServiceId}
        )`);
    }

    return {
        joinClause: joins.join('\n        '),
        whereClause: wheres.length > 0 ? wheres.join('\n            AND ') : '1=1',

    };
}

function mapRow(r: ProjectRow) {
    return {
        id: r.PROJECT_ID,
        code: r.PROJECT_NUMBER ?? '',
        name: r.PROJECT_NAME ?? '',
        location: '',
        organizationShort: ADMIN_MAP[r.PROGRAM_ADMIN_ID ?? -1] ?? '',
        investmentArea: r.INVESTMENT_AREAS ?? '',
        status: r.PROJECT_STATUS ?? '',
        committed: r.COMMITED_FUNDING_AMT
            ? `$${r.COMMITED_FUNDING_AMT.toLocaleString()}`
            : '',
        projectLead: r.COMPANY_NAME ?? '',
        imageKey: r.PROJECT_NUMBER
            ? `${r.PROJECT_NUMBER.toLowerCase()}/${r.PROJECT_NUMBER.toLowerCase()}_main`
            : '',
        programAdminId: r.PROGRAM_ADMIN_ID,
        INVESTMENT_PROGRAM_PERIOD_PERIOD_ID: r.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID,
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '100', 10)));
        const offset = (page - 1) * limit;
        const t = `${DB}.${SCHEMA}`;

        const { joinClause, whereClause } = buildQuery(searchParams);

        const [rows, countRows] = (await Promise.all([
            query(`
                SELECT
                    p.PROJECT_ID,
                    p.PROJECT_NUMBER,
                    p.PROJECT_NAME,
                    p.PROJECT_STATUS,
                    p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS PROGRAM_ADMIN_ID,
                    p.PERSON_CONTACT_FIRST_NAME,
                    p.PERSON_CONTACT_LAST_NAME,
                    p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID,
                    c.COMPANY_NAME,
                    fd.COMMITED_FUNDING_AMT,
                    LISTAGG(DISTINCT ia.INVESTMENT_AREA_NAME, ', ')
                        WITHIN GROUP (ORDER BY ia.INVESTMENT_AREA_NAME) AS INVESTMENT_AREAS
                FROM ${t}.PROJECT p
                ${joinClause}
                WHERE ${whereClause}
                GROUP BY
                    p.PROJECT_ID,
                    p.PROJECT_NUMBER,
                    p.PROJECT_NAME,
                    p.PROJECT_STATUS,
                    p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID,
                    p.PERSON_CONTACT_FIRST_NAME,
                    p.PERSON_CONTACT_LAST_NAME,
                    p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID,
                    c.COMPANY_NAME,
                    fd.COMMITED_FUNDING_AMT
                ORDER BY p.PROJECT_ID DESC
                LIMIT ${limit} OFFSET ${offset}
            `),
            query(`
                SELECT COUNT(DISTINCT p.PROJECT_ID) AS TOTAL
                FROM ${t}.PROJECT p
                ${joinClause}
                WHERE ${whereClause}
            `),
        ])) as [ProjectRow[], CountRow[]];

        const total = countRows[0]?.TOTAL ?? 0;

        return NextResponse.json({
            projects: rows.map(mapRow),
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
            { status: 500 }
        );
    }
}