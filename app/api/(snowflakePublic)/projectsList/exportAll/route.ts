// ─── api/projectsList/exportAll/route.ts ──────────────
// Entire Database export — 4-sheet .xlsx (Projects, Details, Finances, Metrics)

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import ExcelJS from 'exceljs';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

// ── Helper: style header + add data to a sheet ───────────────────────

function addSheet(
    wb: ExcelJS.Workbook,
    name: string,
    columns: { header: string; key: string; width: number; numFmt?: string }[],
    rows: Record<string, unknown>[]
) {
    const ws = wb.addWorksheet(name);
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

    // Apply number formats
    columns.forEach((col, i) => {
        if (col.numFmt) ws.getColumn(i + 1).numFmt = col.numFmt;
    });

    // Auto-filter
    if (rows.length > 0 && columns.length <= 26) {
        const lastCol = String.fromCharCode(64 + columns.length);
        ws.autoFilter = { from: 'A1', to: `${lastCol}1` };
    }

    return ws;
}

export async function GET() {
    try {
        const t = `${DB}.${SCHEMA}`;

        // ── Run all 4 queries in parallel ──

        const [projectsRows, detailsRows, financesRows, metricsRows] = await Promise.all([
            // Tab 1: Projects
            query(`
WITH ProjectInvestmentAreas AS (
    SELECT pia.PROJECT_PROJECT_ID,
           LISTAGG(DISTINCT ia.INVESTMENT_AREA_NAME, ', ') AS InvestmentArea
    FROM ${t}.PROJECT_HAS_INVESTMENT_AREA pia
    JOIN ${t}.INVESTMENT_AREA ia ON ia.INVESTMENT_AREA_ID = pia.INVESTMENT_AREA_INVESTMENT_AREA_ID
    GROUP BY pia.PROJECT_PROJECT_ID
),
ProjectDevelopmentStages AS (
    SELECT phds.PROJECT_PROJECT_ID,
           LISTAGG(DISTINCT ds.DEVELOPMENT_STAGE_NAME, ', ') AS DevelopmentStage
    FROM ${t}.PROJECT_HAS_DEVELOPMENT_STAGE phds
    JOIN ${t}.DEVELOPMENT_STAGE ds ON ds.DEVELOPMENT_STAGE_ID = phds.DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID
    GROUP BY phds.PROJECT_PROJECT_ID
),
ProjectBusinessClassifications AS (
    SELECT pdbc.PROJECT_DETAIL_PROJECT_DETAIL_ID,
           LISTAGG(DISTINCT bc.BUSINESS_CLASSIFICATION_NAME, ', ') AS BusinessClassifications
    FROM ${t}.PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION pdbc
    JOIN ${t}.BUSINESS_CLASSIFICATION bc ON bc.BUSINESS_CLASSIFICATION_ID = pdbc.BUSINESS_CLASSIFICATION_BUSINESS_CLASSIFICATION_ID
    GROUP BY pdbc.PROJECT_DETAIL_PROJECT_DETAIL_ID
),
ProjectCpucProceedings AS (
    SELECT pcp.PROJECT_PROJECT_ID,
           LISTAGG(DISTINCT cp.CPUC_PROCEEDING_NUMBER, ', ') AS CpucProceedings
    FROM ${t}.PROJECT_HAS_CPUC_PROCEEDING pcp
    JOIN ${t}.CPUC_PROCEEDING cp ON cp.CPUC_PROCEEDING_ID = pcp.CPUC_PROCEEDING_CPUC_PROCEEDING_ID
    GROUP BY pcp.PROJECT_PROJECT_ID
),
ProjectPartners AS (
    SELECT pdp.PROJECT_DETAIL_PROJECT_DETAIL_ID,
           LISTAGG(DISTINCT c.COMPANY_NAME, ', ') AS Partners
    FROM ${t}.PROJECT_DETAIL_HAS_PARTNER pdp
    JOIN ${t}.COMPANY c ON c.COMPANY_ID = pdp.COMPANY_COMPANY_ID
    GROUP BY pdp.PROJECT_DETAIL_PROJECT_DETAIL_ID
)
SELECT
    p.PROJECT_ID, p.PROJECT_NUMBER, p.PROJECT_NAME, p.PROJECT_STATUS,
    p.PROJECT_PUBLIC_URL, p.PROJECT_AWARD_DATE, p.PROJECT_START_DATE, p.PROJECT_END_DATE,
    p.CREATE_DATE, p.MODIFIED_DATE,
    p.STANDARDS, p.CYBER_SECURITY_CONSIDERATIONS, p.IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED,
    p.PERSON_CONTACT_FIRST_NAME, p.PERSON_CONTACT_LAST_NAME, p.PERSON_CONTACT_EMAIL, p.PERSON_CONTACT_TITLE,
    p.CEC_MGR_CONTACT_FIRST_NAME, p.CEC_MGR_CONTACT_LAST_NAME, p.CEC_MGR_CONTACT_PHONE,
    p.CPUC_DAC, p.CPUC_LI,
    fd.COMMITED_FUNDING_AMT,
    leadCompany.COMPANY_NAME AS PROJECT_LEAD,
    pg.PROGRAM_ADMIN_NAME,
    pia.InvestmentArea AS INVESTMENT_AREA,
    pt.PROJECT_TYPE_NAME AS PROJECT_TYPE,
    pds.DevelopmentStage AS DEVELOPMENT_STAGE,
    adAfter.ASSEMBLY_DISTRICT_ID AS ASSEMBLY_DISTRICT,
    sdAfter.SENATE_DISTRICT_ID AS SENATE_DISTRICT,
    ipp.PERIOD_NAME AS INVESTMENT_PROGRAM_PERIOD,
    pbc.BusinessClassifications AS BUSINESS_CLASSIFICATIONS,
    pcpAgg.CpucProceedings AS CPUC_PROCEEDINGS,
    pp.Partners AS PARTNERS,
    CASE WHEN p.COMMUNITY_BENEFITS = 1 THEN 'Yes' ELSE 'No' END AS COMMUNITY_BENEFITS
FROM ${t}.PROJECT p
    LEFT JOIN ${t}.FINANCE_DETAIL fd ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
    LEFT JOIN ${t}.PROJECT_DETAIL pd ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
    LEFT JOIN ${t}.COMPANY leadCompany ON p.PROJECT_LEAD_COMPANY_ID = leadCompany.COMPANY_ID
    LEFT JOIN ${t}.PROGRAM_ADMIN pg ON pg.PROGRAM_ADMIN_ID = p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID
    LEFT JOIN ${t}.PROJECT_TYPE pt ON p.PROJECT_TYPE_PROJECT_TYPE_ID = pt.PROJECT_TYPE_ID
    LEFT JOIN ${t}.INVESTMENT_PROGRAM_PERIOD ipp ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
    LEFT JOIN ${t}.ASSEMBLY_DISTRICT adAfter ON p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID = adAfter.ASSEMBLY_DISTRICT_ID
    LEFT JOIN ${t}.SENATE_DISTRICT sdAfter ON p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID = sdAfter.SENATE_DISTRICT_ID
    LEFT JOIN ProjectInvestmentAreas pia ON pia.PROJECT_PROJECT_ID = p.PROJECT_ID
    LEFT JOIN ProjectDevelopmentStages pds ON pds.PROJECT_PROJECT_ID = p.PROJECT_ID
    LEFT JOIN ProjectBusinessClassifications pbc ON pbc.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID
    LEFT JOIN ProjectCpucProceedings pcpAgg ON pcpAgg.PROJECT_PROJECT_ID = p.PROJECT_ID
    LEFT JOIN ProjectPartners pp ON pp.PROJECT_DETAIL_PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID
WHERE COALESCE(p.IS_ACTIVE, 1) = 1
ORDER BY p.PROJECT_ID DESC
            `),

            // Tab 2: Details
            query(`
SELECT
    p.PROJECT_ID, p.PROJECT_NUMBER,
    pd.PROJECT_DETAIL_ID,
    pd.DETAILED_PROJECT_DESCRIPTION, pd.SUMMARY_PROJECT_DESCRIPTION,
    pd.PROJECT_UPDATE, pd.DELIVERABLES, pd.STATE_POLICY_SUPPORT_TEXT,
    pd.TECHNICAL_BARRIERS, pd.MARKET_BARRIERS, pd.POLICY_AND_REGULATORY_BARRIERS,
    pd.GETTING_TO_SCALE, pd.KEY_INNOVATIONS, pd.KEY_LEARNINGS, pd.SCALABILITY,
    pd.CYBER_SECURITY_NARRATIVE, pd.PROJECT_GOALS, pd.FINAL_REPORT_URL_LAST_UPDATED
FROM ${t}.PROJECT p
LEFT JOIN ${t}.PROJECT_DETAIL pd ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
WHERE COALESCE(p.IS_ACTIVE, 1) = 1
ORDER BY p.PROJECT_ID DESC
            `),

            // Tab 3: Finances
            query(`
WITH FundingMechanisms AS (
    SELECT fdhfm.FINANCE_DETAIL_FINANCE_DETAIL_ID,
           LISTAGG(DISTINCT fm.FUNDING_MECHANISM_NAME, ', ') AS FUNDING_MECHANISMS
    FROM ${t}.FINANCE_DETAIL_HAS_FUNDING_MECHANISM fdhfm
    JOIN ${t}.FUNDING_MECHANISM fm ON fm.FUNDING_MECHANISM_ID = fdhfm.FUNDING_MECHANISM_FUNDING_MECHANISM_ID
    GROUP BY fdhfm.FINANCE_DETAIL_FINANCE_DETAIL_ID
),
MatchFundingPartners AS (
    SELECT fdhmfp.FINANCE_DETAIL_FINANCE_DETAIL_ID,
           LISTAGG(DISTINCT c.COMPANY_NAME, ', ') AS MATCH_FUNDING_PARTNERS
    FROM ${t}.FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER fdhmfp
    JOIN ${t}.COMPANY c ON c.COMPANY_ID = fdhmfp.COMPANY_COMPANY_ID
    GROUP BY fdhmfp.FINANCE_DETAIL_FINANCE_DETAIL_ID
)
SELECT
    p.PROJECT_ID, p.PROJECT_NUMBER,
    COALESCE(fd.COMMITED_FUNDING_AMT, 0) AS COMMITED_FUNDING_AMT,
    COALESCE(fd.ENCUMBERED_FUNDING_AMT, 0) AS ENCUMBERED_FUNDING_AMT,
    COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0) AS FUNDS_EXPENDED_TO_DATE,
    COALESCE(fd.ADMIN_AND_OVERHEAD_COST, 0) AS ADMIN_AND_OVERHEAD_COST,
    COALESCE(fd.MATCH_FUNDING, 0) AS MATCH_FUNDING,
    COALESCE(fd.NUM_OF_BIDDERS, 0) AS NUM_OF_BIDDERS,
    COALESCE(fd.RANK_OF_SELECTED_BIDDERS, 0) AS RANK_OF_SELECTED_BIDDERS,
    COALESCE(fd.CONTRACT_AMOUNT, 0) AS CONTRACT_AMOUNT,
    fd.BIDDER_DESCRIPTION,
    COALESCE(fd.LEVERAGED_FUNDS, 0) AS LEVERAGED_FUNDS,
    COALESCE(fd.MATCH_FUNDING_SPLIT, 0) AS MATCH_FUNDING_SPLIT,
    COALESCE(fmech.FUNDING_MECHANISMS, '') AS FUNDING_MECHANISMS,
    COALESCE(mfp.MATCH_FUNDING_PARTNERS, '') AS MATCH_FUNDING_PARTNERS
FROM ${t}.PROJECT p
LEFT JOIN ${t}.FINANCE_DETAIL fd ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
LEFT JOIN FundingMechanisms fmech ON fmech.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
LEFT JOIN MatchFundingPartners mfp ON mfp.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
WHERE COALESCE(p.IS_ACTIVE, 1) = 1
ORDER BY p.PROJECT_ID DESC
            `),

            // Tab 4: Metrics
            query(`
SELECT
    p.PROJECT_ID, p.PROJECT_NUMBER,
    COALESCE(pm.ELECTRICITY_SYSTEM_RELIABILITY_IMPACTS, '') AS RELIABILITY_IMPACTS,
    COALESCE(pm.ELECTRICITY_SYSTEM_SAFETY_IMPACTS, '') AS SAFETY_IMPACTS,
    COALESCE(pm.ENVIRONMENTAL_IMPACTS_NON_GHG, '') AS ENVIRONMENTAL_IMPACTS,
    COALESCE(pm.PROJECTED_PROJECT_BENEFITS, '') AS PROJECTED_BENEFITS,
    COALESCE(pm.RATEPAYERS_BENEFITS, '') AS RATEPAYER_BENEFITS,
    COALESCE(pm.COMMUNITY_BENEFITS_DESC, '') AS COMMUNITY_BENEFITS,
    COALESCE(pm.ENERGY_IMPACTS, '') AS ENERGY_IMPACTS,
    COALESCE(pm.INFRASTRUCTURE_COST_REDUCTIONS_AND_ECONOMIC_BENEFITS, '') AS INFRASTRUCTURE_BENEFITS,
    COALESCE(pm.OTHER_IMPACTS, '') AS OTHER_IMPACTS,
    COALESCE(pm.INFORMATION_DISSEMINATION, '') AS INFO_DISSEMINATION,
    COALESCE(pm.GHG_IMPACTS, '') AS GHG_IMPACTS
FROM ${t}.PROJECT p
LEFT JOIN ${t}.PROJECT_METRIC pm ON pm.PROJECT_METRIC_ID = p.PROJECT_METRIC_PROJECT_METRIC_ID
WHERE COALESCE(p.IS_ACTIVE, 1) = 1
ORDER BY p.PROJECT_ID DESC
            `),
        ]) as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[]];

        // ── Build workbook ──
        const wb = new ExcelJS.Workbook();
        const cur = '$#,##0.00';

        // Tab 1: Projects
        addSheet(wb, 'Projects', [
            { header: 'Project ID', key: 'PROJECT_ID', width: 12 },
            { header: 'Project Number', key: 'PROJECT_NUMBER', width: 18 },
            { header: 'Project Name', key: 'PROJECT_NAME', width: 40 },
            { header: 'Status', key: 'PROJECT_STATUS', width: 14 },
            { header: 'Program Admin', key: 'PROGRAM_ADMIN_NAME', width: 18 },
            { header: 'Project Type', key: 'PROJECT_TYPE', width: 20 },
            { header: 'Investment Area', key: 'INVESTMENT_AREA', width: 30 },
            { header: 'Investment Period', key: 'INVESTMENT_PROGRAM_PERIOD', width: 18 },
            { header: 'Development Stage', key: 'DEVELOPMENT_STAGE', width: 24 },
            { header: 'Award Date', key: 'PROJECT_AWARD_DATE', width: 14 },
            { header: 'Start Date', key: 'PROJECT_START_DATE', width: 14 },
            { header: 'End Date', key: 'PROJECT_END_DATE', width: 14 },
            { header: 'Committed Funding', key: 'COMMITED_FUNDING_AMT', width: 20, numFmt: cur },
            { header: 'Project Lead', key: 'PROJECT_LEAD', width: 30 },
            { header: 'Partners', key: 'PARTNERS', width: 30 },
            { header: 'DAC', key: 'CPUC_DAC', width: 8 },
            { header: 'Low Income', key: 'CPUC_LI', width: 10 },
            { header: 'Community Benefits', key: 'COMMUNITY_BENEFITS', width: 18 },
            { header: 'Assembly District', key: 'ASSEMBLY_DISTRICT', width: 18 },
            { header: 'Senate District', key: 'SENATE_DISTRICT', width: 16 },
            { header: 'Business Classifications', key: 'BUSINESS_CLASSIFICATIONS', width: 24 },
            { header: 'CPUC Proceedings', key: 'CPUC_PROCEEDINGS', width: 20 },
            { header: 'Standards', key: 'STANDARDS', width: 10 },
            { header: 'Cybersecurity', key: 'CYBER_SECURITY_CONSIDERATIONS', width: 14 },
            { header: 'Contact First', key: 'PERSON_CONTACT_FIRST_NAME', width: 16 },
            { header: 'Contact Last', key: 'PERSON_CONTACT_LAST_NAME', width: 16 },
        ], projectsRows);

        // Tab 2: Details
        addSheet(wb, 'Details', [
            { header: 'Project ID', key: 'PROJECT_ID', width: 12 },
            { header: 'Project Number', key: 'PROJECT_NUMBER', width: 18 },
            { header: 'Project Summary', key: 'SUMMARY_PROJECT_DESCRIPTION', width: 50 },
            { header: 'Detailed Description', key: 'DETAILED_PROJECT_DESCRIPTION', width: 50 },
            { header: 'Project Update', key: 'PROJECT_UPDATE', width: 50 },
            { header: 'Deliverables', key: 'DELIVERABLES', width: 40 },
            { header: 'State Policy Support', key: 'STATE_POLICY_SUPPORT_TEXT', width: 40 },
            { header: 'Technical Barriers', key: 'TECHNICAL_BARRIERS', width: 40 },
            { header: 'Market Barriers', key: 'MARKET_BARRIERS', width: 40 },
            { header: 'Policy & Regulatory Barriers', key: 'POLICY_AND_REGULATORY_BARRIERS', width: 40 },
            { header: 'Getting to Scale', key: 'GETTING_TO_SCALE', width: 40 },
            { header: 'Key Innovations', key: 'KEY_INNOVATIONS', width: 40 },
            { header: 'Key Learnings', key: 'KEY_LEARNINGS', width: 40 },
            { header: 'Scalability', key: 'SCALABILITY', width: 40 },
            { header: 'Cybersecurity Narrative', key: 'CYBER_SECURITY_NARRATIVE', width: 40 },
            { header: 'Project Goals', key: 'PROJECT_GOALS', width: 40 },
        ], detailsRows);

        // Tab 3: Finances
        addSheet(wb, 'Finances', [
            { header: 'Project ID', key: 'PROJECT_ID', width: 12 },
            { header: 'Project Number', key: 'PROJECT_NUMBER', width: 18 },
            { header: 'Committed Funding', key: 'COMMITED_FUNDING_AMT', width: 20, numFmt: cur },
            { header: 'Encumbered Funding', key: 'ENCUMBERED_FUNDING_AMT', width: 20, numFmt: cur },
            { header: 'Funds Expended', key: 'FUNDS_EXPENDED_TO_DATE', width: 18, numFmt: cur },
            { header: 'Admin & Overhead', key: 'ADMIN_AND_OVERHEAD_COST', width: 18, numFmt: cur },
            { header: 'Match Funding', key: 'MATCH_FUNDING', width: 16, numFmt: cur },
            { header: '# Bidders', key: 'NUM_OF_BIDDERS', width: 10 },
            { header: 'Bidder Rank', key: 'RANK_OF_SELECTED_BIDDERS', width: 12 },
            { header: 'Contract Amount', key: 'CONTRACT_AMOUNT', width: 18, numFmt: cur },
            { header: 'Bidder Description', key: 'BIDDER_DESCRIPTION', width: 40 },
            { header: 'Leveraged Funds', key: 'LEVERAGED_FUNDS', width: 16, numFmt: cur },
            { header: 'Match Funding Split', key: 'MATCH_FUNDING_SPLIT', width: 18 },
            { header: 'Funding Mechanisms', key: 'FUNDING_MECHANISMS', width: 30 },
            { header: 'Match Funding Partners', key: 'MATCH_FUNDING_PARTNERS', width: 30 },
        ], financesRows);

        // Tab 4: Metrics
        addSheet(wb, 'Metrics', [
            { header: 'Project ID', key: 'PROJECT_ID', width: 12 },
            { header: 'Project Number', key: 'PROJECT_NUMBER', width: 18 },
            { header: 'Reliability Impacts', key: 'RELIABILITY_IMPACTS', width: 40 },
            { header: 'Safety Impacts', key: 'SAFETY_IMPACTS', width: 40 },
            { header: 'Environmental Impacts', key: 'ENVIRONMENTAL_IMPACTS', width: 40 },
            { header: 'Projected Benefits', key: 'PROJECTED_BENEFITS', width: 40 },
            { header: 'Ratepayer Benefits', key: 'RATEPAYER_BENEFITS', width: 40 },
            { header: 'Community Benefits', key: 'COMMUNITY_BENEFITS', width: 40 },
            { header: 'Energy Impacts', key: 'ENERGY_IMPACTS', width: 40 },
            { header: 'Infrastructure & Economic', key: 'INFRASTRUCTURE_BENEFITS', width: 40 },
            { header: 'Other Impacts', key: 'OTHER_IMPACTS', width: 40 },
            { header: 'Info Dissemination', key: 'INFO_DISSEMINATION', width: 40 },
            { header: 'GHG Impacts', key: 'GHG_IMPACTS', width: 40 },
        ], metricsRows);

        const arrayBuffer = await wb.xlsx.writeBuffer();

        return new NextResponse(new Uint8Array(arrayBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="epic_database_export.xlsx"',
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Full export error:', message);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}