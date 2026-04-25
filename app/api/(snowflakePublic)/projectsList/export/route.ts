// ─── api/projectsList/export/route.ts ─────────────────
// Filtered Results export — single-sheet .xlsx respecting current search + filters

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import ExcelJS from 'exceljs';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

function safeStr(v: string) { return v.replace(/'/g, "''"); }
function safeInt(v: string) { const n = parseInt(v, 10); return isNaN(n) ? null : n; }
function safeFloat(v: string) { const n = parseFloat(v.replace(/[$,]/g, '')); return isNaN(n) ? null : n; }

function buildFilterClauses(sp: URLSearchParams): string {
    const c: string[] = [];

    const search = sp.get('search')?.trim();
    if (search) {
        const s = safeStr(search);
        c.push(`(
            LOWER(p.PROJECT_NAME) LIKE LOWER('%${s}%')
            OR LOWER(p.PROJECT_NUMBER) LIKE LOWER('%${s}%')
            OR LOWER(leadCompany.COMPANY_NAME) LIKE LOWER('%${s}%')
            OR LOWER(p.PERSON_CONTACT_FIRST_NAME) LIKE LOWER('%${s}%')
            OR LOWER(p.PERSON_CONTACT_LAST_NAME) LIKE LOWER('%${s}%')
        )`);
    }

    const investmentAreaId = safeInt(sp.get('investmentAreaId') ?? '');
    if (investmentAreaId !== null) {
        c.push(`EXISTS (SELECT 1 FROM ${DB}.${SCHEMA}.PROJECT_HAS_INVESTMENT_AREA x WHERE x.PROJECT_PROJECT_ID = p.PROJECT_ID AND x.INVESTMENT_AREA_INVESTMENT_AREA_ID = ${investmentAreaId})`);
    }

    const projectTypeId = safeInt(sp.get('projectTypeId') ?? '');
    if (projectTypeId !== null) c.push(`p.PROJECT_TYPE_PROJECT_TYPE_ID = ${projectTypeId}`);

    const developmentStageId = safeInt(sp.get('developmentStageId') ?? '');
    if (developmentStageId !== null) {
        c.push(`EXISTS (SELECT 1 FROM ${DB}.${SCHEMA}.PROJECT_HAS_DEVELOPMENT_STAGE x WHERE x.PROJECT_PROJECT_ID = p.PROJECT_ID AND x.DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID = ${developmentStageId})`);
    }

    const status = sp.get('status')?.trim();
    if (status) c.push(`LOWER(p.PROJECT_STATUS) = LOWER('${safeStr(status)}')`);

    const programAdminId = safeInt(sp.get('programAdminId') ?? '');
    if (programAdminId !== null) c.push(`p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID = ${programAdminId}`);

    const investmentPeriodId = safeInt(sp.get('investmentPeriodId') ?? '');
    if (investmentPeriodId !== null) c.push(`p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ${investmentPeriodId}`);

    const cpucProceedingId = safeInt(sp.get('cpucProceedingId') ?? '');
    if (cpucProceedingId !== null) {
        c.push(`EXISTS (SELECT 1 FROM ${DB}.${SCHEMA}.PROJECT_HAS_CPUC_PROCEEDING x WHERE x.PROJECT_PROJECT_ID = p.PROJECT_ID AND x.CPUC_PROCEEDING_CPUC_PROCEEDING_ID = ${cpucProceedingId})`);
    }

    const businessClassId = safeInt(sp.get('businessClassId') ?? '');
    if (businessClassId !== null) {
        c.push(`EXISTS (SELECT 1 FROM ${DB}.${SCHEMA}.PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION x WHERE x.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID AND x.BUSINESS_CLASSIFICATION_BUSINESS_CLASSIFICATION_ID = ${businessClassId})`);
    }

    const utilityServiceId = safeInt(sp.get('utilityServiceId') ?? '');
    if (utilityServiceId !== null) {
        c.push(`EXISTS (SELECT 1 FROM ${DB}.${SCHEMA}.PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA x WHERE x.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID AND x.UTILITY_SERVICE_AREA_UTILITY_SERVICE_AREA_ID = ${utilityServiceId})`);
    }

    const assemblyDistrictId = safeInt(sp.get('assemblyDistrictId') ?? '');
    if (assemblyDistrictId !== null) c.push(`p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID = ${assemblyDistrictId}`);

    const senateDistrictId = safeInt(sp.get('senateDistrictId') ?? '');
    if (senateDistrictId !== null) c.push(`p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID = ${senateDistrictId}`);

    const contractMin = safeFloat(sp.get('contractMin') ?? '');
    if (contractMin !== null) c.push(`fd.COMMITED_FUNDING_AMT >= ${contractMin}`);

    const contractMax = safeFloat(sp.get('contractMax') ?? '');
    if (contractMax !== null) c.push(`fd.COMMITED_FUNDING_AMT <= ${contractMax}`);

    if (sp.get('disadvantaged') === '1') c.push(`p.CPUC_DAC = 1`);
    if (sp.get('lowIncome') === '1') c.push(`p.CPUC_LI = 1`);
    if (sp.get('communityBenefits') === '1') c.push(`p.COMMUNITY_BENEFITS = 1`);

    return c.length > 0 ? 'AND ' + c.join('\n            AND ') : '';
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filterClause = buildFilterClauses(searchParams);
        const t = `${DB}.${SCHEMA}`;

        const sql = `
WITH ProjectInvestmentAreas AS (
    SELECT pia.PROJECT_PROJECT_ID,
           LISTAGG(DISTINCT ia.INVESTMENT_AREA_NAME, ', ') WITHIN GROUP (ORDER BY ia.INVESTMENT_AREA_NAME) AS InvestmentAreas
    FROM ${t}.PROJECT_HAS_INVESTMENT_AREA pia
    JOIN ${t}.INVESTMENT_AREA ia ON ia.INVESTMENT_AREA_ID = pia.INVESTMENT_AREA_INVESTMENT_AREA_ID
    GROUP BY pia.PROJECT_PROJECT_ID
),
ProjectPartners AS (
    SELECT pdp.PROJECT_DETAIL_PROJECT_DETAIL_ID,
           LISTAGG(DISTINCT c.COMPANY_NAME, ', ') WITHIN GROUP (ORDER BY c.COMPANY_NAME) AS Partners
    FROM ${t}.PROJECT_DETAIL_HAS_PARTNER pdp
    JOIN ${t}.COMPANY c ON pdp.COMPANY_COMPANY_ID = c.COMPANY_ID
    GROUP BY pdp.PROJECT_DETAIL_PROJECT_DETAIL_ID
),
ProjectDevelopmentStages AS (
    SELECT pds.PROJECT_PROJECT_ID,
           LISTAGG(DISTINCT ds.DEVELOPMENT_STAGE_NAME, ', ') WITHIN GROUP (ORDER BY ds.DEVELOPMENT_STAGE_NAME) AS DevelopmentStages
    FROM ${t}.PROJECT_HAS_DEVELOPMENT_STAGE pds
    JOIN ${t}.DEVELOPMENT_STAGE ds ON ds.DEVELOPMENT_STAGE_ID = pds.DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID
    GROUP BY pds.PROJECT_PROJECT_ID
),
ProjectBusinessClassifications AS (
    SELECT pdbc.PROJECT_DETAIL_PROJECT_DETAIL_ID,
           LISTAGG(DISTINCT bc.BUSINESS_CLASSIFICATION_NAME, ', ') WITHIN GROUP (ORDER BY bc.BUSINESS_CLASSIFICATION_NAME) AS BusinessClassifications
    FROM ${t}.PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION pdbc
    JOIN ${t}.BUSINESS_CLASSIFICATION bc ON bc.BUSINESS_CLASSIFICATION_ID = pdbc.BUSINESS_CLASSIFICATION_BUSINESS_CLASSIFICATION_ID
    GROUP BY pdbc.PROJECT_DETAIL_PROJECT_DETAIL_ID
),
ProjectUtilityServiceAreas AS (
    SELECT pdusa.PROJECT_DETAIL_PROJECT_DETAIL_ID,
           LISTAGG(DISTINCT usa.UTILITY_SERVICE_AREA_NAME, ', ') WITHIN GROUP (ORDER BY usa.UTILITY_SERVICE_AREA_NAME) AS UtilityServiceAreas
    FROM ${t}.PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA pdusa
    JOIN ${t}.UTILITY_SERVICE_AREA usa ON usa.UTILITY_SERVICE_AREA_ID = pdusa.UTILITY_SERVICE_AREA_UTILITY_SERVICE_AREA_ID
    GROUP BY pdusa.PROJECT_DETAIL_PROJECT_DETAIL_ID
)
SELECT
    p.PROJECT_ID, p.PROJECT_NUMBER, p.PROJECT_NAME, p.PROJECT_STATUS,
    pg.PROGRAM_ADMIN_NAME,
    p.PROJECT_AWARD_DATE, p.PROJECT_START_DATE, p.PROJECT_END_DATE,
    p.CPUC_DAC, p.CPUC_LI,
    fd.COMMITED_FUNDING_AMT, fd.ENCUMBERED_FUNDING_AMT,
    fd.FUNDS_EXPENDED_TO_DATE, fd.ADMIN_AND_OVERHEAD_COST,
    fd.MATCH_FUNDING, fd.LEVERAGED_FUNDS,
    leadCompany.COMPANY_NAME AS PROJECT_LEAD,
    pia.InvestmentAreas AS INVESTMENT_AREAS,
    pp.Partners AS PARTNERS,
    pds.DevelopmentStages AS DEVELOPMENT_STAGES,
    pbc.BusinessClassifications AS BUSINESS_CLASSIFICATIONS,
    pusa.UtilityServiceAreas AS UTILITY_SERVICE_AREAS,
    ad.ASSEMBLY_DISTRICT_NAME, sd.SENATE_DISTRICT_NAME,
    pd.SUMMARY_PROJECT_DESCRIPTION
FROM ${t}.PROJECT p
    LEFT JOIN ${t}.FINANCE_DETAIL fd ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
    LEFT JOIN ${t}.PROJECT_DETAIL pd ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
    LEFT JOIN ${t}.COMPANY leadCompany ON p.PROJECT_LEAD_COMPANY_ID = leadCompany.COMPANY_ID
    LEFT JOIN ${t}.PROGRAM_ADMIN pg ON pg.PROGRAM_ADMIN_ID = p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID
    LEFT JOIN ${t}.ASSEMBLY_DISTRICT ad ON p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID = ad.ASSEMBLY_DISTRICT_ID
    LEFT JOIN ${t}.SENATE_DISTRICT sd ON p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID = sd.SENATE_DISTRICT_ID
    LEFT JOIN ProjectInvestmentAreas pia ON pia.PROJECT_PROJECT_ID = p.PROJECT_ID
    LEFT JOIN ProjectPartners pp ON pp.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID
    LEFT JOIN ProjectDevelopmentStages pds ON pds.PROJECT_PROJECT_ID = p.PROJECT_ID
    LEFT JOIN ProjectBusinessClassifications pbc ON pbc.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID
    LEFT JOIN ProjectUtilityServiceAreas pusa ON pusa.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID
WHERE COALESCE(p.IS_ACTIVE, 1) = 1
${filterClause}
ORDER BY p.PROJECT_ID DESC`;

        const rows = (await query(sql)) as Record<string, unknown>[];

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Filtered Projects');

        const columns = [
            { header: 'Project ID', key: 'PROJECT_ID', width: 12 },
            { header: 'Project Number', key: 'PROJECT_NUMBER', width: 18 },
            { header: 'Project Name', key: 'PROJECT_NAME', width: 40 },
            { header: 'Status', key: 'PROJECT_STATUS', width: 14 },
            { header: 'Program Admin', key: 'PROGRAM_ADMIN_NAME', width: 18 },
            { header: 'Award Date', key: 'PROJECT_AWARD_DATE', width: 14 },
            { header: 'Start Date', key: 'PROJECT_START_DATE', width: 14 },
            { header: 'End Date', key: 'PROJECT_END_DATE', width: 14 },
            { header: 'DAC', key: 'CPUC_DAC', width: 8 },
            { header: 'Low Income', key: 'CPUC_LI', width: 10 },
            { header: 'Committed Funding', key: 'COMMITED_FUNDING_AMT', width: 20 },
            { header: 'Encumbered Funding', key: 'ENCUMBERED_FUNDING_AMT', width: 20 },
            { header: 'Funds Expended', key: 'FUNDS_EXPENDED_TO_DATE', width: 18 },
            { header: 'Admin & Overhead', key: 'ADMIN_AND_OVERHEAD_COST', width: 18 },
            { header: 'Match Funding', key: 'MATCH_FUNDING', width: 16 },
            { header: 'Leveraged Funds', key: 'LEVERAGED_FUNDS', width: 16 },
            { header: 'Project Lead', key: 'PROJECT_LEAD', width: 30 },
            { header: 'Investment Areas', key: 'INVESTMENT_AREAS', width: 30 },
            { header: 'Partners', key: 'PARTNERS', width: 30 },
            { header: 'Development Stages', key: 'DEVELOPMENT_STAGES', width: 24 },
            { header: 'Business Classifications', key: 'BUSINESS_CLASSIFICATIONS', width: 24 },
            { header: 'Utility Service Areas', key: 'UTILITY_SERVICE_AREAS', width: 24 },
            { header: 'Assembly District', key: 'ASSEMBLY_DISTRICT_NAME', width: 18 },
            { header: 'Senate District', key: 'SENATE_DISTRICT_NAME', width: 16 },
            { header: 'Project Summary', key: 'SUMMARY_PROJECT_DESCRIPTION', width: 50 },
        ];

        ws.columns = columns;

        // Style header
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        headerRow.alignment = { vertical: 'middle' };
        headerRow.height = 28;

        for (const row of rows) {
            ws.addRow(columns.map((col) => row[col.key] ?? ''));
        }

        // Currency format
        for (const colNum of [11, 12, 13, 14, 15, 16]) {
            ws.getColumn(colNum).numFmt = '$#,##0.00';
        }

        ws.autoFilter = { from: 'A1', to: `Y1` };

        const arrayBuffer = await wb.xlsx.writeBuffer();

        return new NextResponse(new Uint8Array(arrayBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="epic_filtered_export.xlsx"',
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Filtered export error:', message);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}