//app/api/(snowflakeUser)/projectEdit/[id]/route.ts
// GET  — fetch ALL project data for the edit form (all tabs)
// PUT  — update a project (with org-based permission enforcement)

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/snowflake';
import { canEditProject, isMasterAdmin } from '@/lib/permissions';

const DB = process.env.SNOWFLAKE_DATABASE;
const SCHEMA = process.env.SNOWFLAKE_SCHEMA;

function safeStr(v: unknown): string {
    return String(v ?? '').replace(/'/g, "''");
}
function safeIntOrNull(v: unknown): string {
    if (v === '' || v === null || v === undefined) return 'NULL';
    const n = parseInt(String(v), 10);
    return isNaN(n) ? 'NULL' : String(n);
}
function safeFloatOrNull(v: unknown): string {
    if (v === '' || v === null || v === undefined) return 'NULL';
    const n = parseFloat(String(v).replace(/[$,]/g, ''));
    return isNaN(n) ? 'NULL' : String(n);
}
function safeDateOrNull(v: unknown): string {
    if (!v || v === '') return 'NULL';
    return `'${safeStr(v)}'`;
}
function toISODate(v: unknown): string {
    if (!v) return '';
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    const s = String(v);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return '';
}

interface JunctionRow { ID: number; }

// ─── GET — full project for edit form ────────────────────────────────

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        // ── Auth gate ──
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];
        if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const t = `${DB}.${SCHEMA}`;
        const pid = parseInt(id, 10);
        if (isNaN(pid)) {
            return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
        }

        // ── Main query: PROJECT + PROJECT_DETAIL + FINANCE_DETAIL ──
        const rows = await query(`
            SELECT
                -- PROJECT
                p.PROJECT_ID,
                p.PROJECT_NUMBER,
                p.PROJECT_NAME,
                p.PROJECT_STATUS,
                p.IS_ACTIVE,
                p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID,
                p.PROJECT_TYPE_PROJECT_TYPE_ID,
                p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID,
                p.PROJECT_START_DATE,
                p.PROJECT_END_DATE,
                p.PROJECT_AWARD_DATE,
                p.PROJECT_PUBLIC_URL,
                p.PROJECT_WEBSITE_ADDRESS_URL,
                p.STANDARDS,
                p.CYBER_SECURITY_CONSIDERATIONS,
                p.IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED,
                p.COMMUNITY_BENEFITS,
                p.CPUC_DAC,
                p.CPUC_LI,
                p.PERSON_CONTACT_FIRST_NAME,
                p.PERSON_CONTACT_LAST_NAME,
                p.PERSON_CONTACT_EMAIL,
                p.PERSON_CONTACT_TITLE,
                p.CEC_MGR_CONTACT_FIRST_NAME,
                p.CEC_MGR_CONTACT_LAST_NAME,
                p.CEC_MGR_CONTACT_TITLE,
                p.CEC_MGR_CONTACT_PHONE,
                p.CEC_MGR_EMAIL,
                p.PROJECT_LEAD_COMPANY_ID,
                p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_BEFORE_REDISTRICTED_ID,
                p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID,
                p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_BEFORE_REDISTRICTED_ID,
                p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID,
                p.PROJECT_DETAIL_PROJECT_DETAIL_ID,
                p.FINANCE_DETAIL_FINANCE_DETAIL_ID,
                p.PROJECT_METRIC_PROJECT_METRIC_ID,
                -- PROJECT_DETAIL
                pd.DETAILED_PROJECT_DESCRIPTION,
                pd.SUMMARY_PROJECT_DESCRIPTION,
                pd.PROJECT_UPDATE AS PD_PROJECT_UPDATE,
                pd.DELIVERABLES,
                pd.STATE_POLICY_SUPPORT_TEXT,
                pd.TECHNICAL_BARRIERS,
                pd.MARKET_BARRIERS,
                pd.POLICY_AND_REGULATORY_BARRIERS,
                pd.GETTING_TO_SCALE,
                pd.KEY_INNOVATIONS,
                pd.KEY_LEARNINGS,
                pd.SCALABILITY,
                pd.CYBER_SECURITY_NARRATIVE,
                pd.FINAL_REPORT_URL,
                -- FINANCE_DETAIL
                fd.COMMITED_FUNDING_AMT,
                fd.ENCUMBERED_FUNDING_AMT,
                fd.FUNDS_EXPENDED_TO_DATE,
                fd.ADMIN_AND_OVERHEAD_COST,
                fd.NUM_OF_BIDDERS,
                fd.RANK_OF_SELECTED_BIDDERS,
                fd.CONTRACT_AMOUNT,
                fd.BIDDER_DESCRIPTION,
                fd.LEVERAGED_FUNDS,
                fd.MATCH_FUNDING_SPLIT,
                fd.MATCH_FUNDING
            FROM ${t}.PROJECT p
            LEFT JOIN ${t}.PROJECT_DETAIL pd
                ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
            LEFT JOIN ${t}.FINANCE_DETAIL fd
                ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
            WHERE p.PROJECT_ID = ${pid}
        `) as Record<string, unknown>[];

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const r = rows[0];

        // ── Per-project permission check ──
        // MasterAdmin can view any project for edit; ProgramAdmin only their org's
        if (!isMasterAdmin(groups)) {
            const userOrg = (session.user as { organization?: string | null }).organization ?? null;
            const projectAdminId = r.PROGRAM_ADMIN_PROGRAM_ADMIN_ID as number | null;
            if (!canEditProject(userOrg, projectAdminId)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const projectDetailId = r.PROJECT_DETAIL_PROJECT_DETAIL_ID as number | null;
        const financeDetailId = r.FINANCE_DETAIL_FINANCE_DETAIL_ID as number | null;
        const projectMetricId = r.PROJECT_METRIC_PROJECT_METRIC_ID as number | null;


        const safeQuery = async (label: string, sql: string): Promise<JunctionRow[]> => {
            try {
                return (await query(sql)) as JunctionRow[];
            } catch (err) {
                console.warn(`[projectEdit GET] "${label}" failed:`, err instanceof Error ? err.message : err);
                return [];
            }
        };

        // ── Junction table IDs (parallel) ──
        const [iaRows, dsRows, cpRows, bcRows, usRows, partnerRows, fmRows, cicRows, mfpRows] = await Promise.all([
            safeQuery('investmentAreas',
                `SELECT INVESTMENT_AREA_INVESTMENT_AREA_ID AS ID FROM ${t}.PROJECT_HAS_INVESTMENT_AREA WHERE PROJECT_PROJECT_ID = ${pid}`),
            safeQuery('developmentStages',
                `SELECT DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID AS ID FROM ${t}.PROJECT_HAS_DEVELOPMENT_STAGE WHERE PROJECT_PROJECT_ID = ${pid}`),
            safeQuery('cpucProceedings',
                `SELECT CPUC_PROCEEDING_CPUC_PROCEEDING_ID AS ID FROM ${t}.PROJECT_HAS_CPUC_PROCEEDING WHERE PROJECT_PROJECT_ID = ${pid}`),
            projectDetailId != null
                ? safeQuery('businessClassifications',
                    `SELECT BUSINESS_CLASSIFICATION_BUSINESS_CLASSIFICATION_ID AS ID FROM ${t}.PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION WHERE PROJECT_DETAIL_PROJECT_DETAIL_ID = ${projectDetailId}`)
                : Promise.resolve([]),
            projectDetailId != null
                ? safeQuery('utilityServiceAreas',
                    `SELECT UTILITY_SERVICE_AREA_UTILITY_SERVICE_AREA_ID AS ID FROM ${t}.PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA WHERE PROJECT_DETAIL_PROJECT_DETAIL_ID = ${projectDetailId}`)
                : Promise.resolve([]),
            projectDetailId != null
                ? safeQuery('partners',
                    `SELECT COMPANY_COMPANY_ID AS ID FROM ${t}.PROJECT_DETAIL_HAS_PARTNER WHERE PROJECT_DETAIL_PROJECT_DETAIL_ID = ${projectDetailId}`)
                : Promise.resolve([]),
            financeDetailId != null
                ? safeQuery('fundingMechanisms',
                    `SELECT FUNDING_MECHANISM_FUNDING_MECHANISM_ID AS ID FROM ${t}.FINANCE_DETAIL_HAS_FUNDING_MECHANISM WHERE FINANCE_DETAIL_FINANCE_DETAIL_ID = ${financeDetailId}`)
                : Promise.resolve([]),
            projectMetricId != null
                ? safeQuery('confidentialCategories',
                    `SELECT CONFIDENTIAL_INFORMATION_CATEGORY_CIC_ID AS ID FROM ${t}.PROJECT_METRIC_HAS_CIC WHERE PROJECT_METRIC_PROJECT_METRIC_ID = ${projectMetricId}`)
                : Promise.resolve([]),
            financeDetailId != null
                ? safeQuery('matchFundingPartners',
                    `SELECT COMPANY_COMPANY_ID AS ID
                     FROM ${t}.FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER
                     WHERE FINANCE_DETAIL_FINANCE_DETAIL_ID = ${financeDetailId}
                     AND IS_ACTIVE = 1`)
                : Promise.resolve([]),
        ]);

        // ── PROJECT_METRIC (Additional Info tab) ──
        let metricData: Record<string, string> = {
            electricitySystemReliabilityImpact: '',
            electricitySystemSafetyImpact: '',
            ghgImpacts: '',
            environmentalImpactNonGhg: '',
            projectedProjectBenefits: '',
            ratepayersBenefits: '',
            communityBenefitsDesc: '',
            energyImpact: '',
            infrastructureCostReductions: '',
            otherImpacts: '',
            informationDissemination: '',
        };

        if (projectMetricId != null) {
            try {
                const pmRows = (await query(
                    `SELECT * FROM ${t}.PROJECT_METRIC WHERE PROJECT_METRIC_ID = ${projectMetricId}`
                )) as Record<string, unknown>[];
                if (pmRows.length > 0) {
                    const pm = pmRows[0];
                    const s = (v: unknown) => (v != null ? String(v) : '');
                    metricData = {
                        electricitySystemReliabilityImpact: s(pm.ELECTRICITY_SYSTEM_RELIABILITY_IMPACTS),
                        electricitySystemSafetyImpact: s(pm.ELECTRICITY_SYSTEM_SAFETY_IMPACTS),
                        ghgImpacts: s(pm.GHG_IMPACTS),
                        environmentalImpactNonGhg: s(pm.ENVIRONMENTAL_IMPACTS_NON_GHG),
                        projectedProjectBenefits: s(pm.PROJECTED_PROJECT_BENEFITS),
                        ratepayersBenefits: s(pm.RATEPAYERS_BENEFITS),
                        communityBenefitsDesc: s(pm.COMMUNITY_BENEFITS_DESC),
                        energyImpact: s(pm.ENERGY_IMPACTS),
                        infrastructureCostReductions: s(pm.INFRASTRUCTURE_COST_REDUCTIONS_AND_ECONOMIC_BENEFITS),
                        otherImpacts: s(pm.OTHER_IMPACTS),
                        informationDissemination: s(pm.INFORMATION_DISSEMINATION),
                    };
                }
            } catch (err) {
                console.warn('[projectEdit GET] PROJECT_METRIC query failed:', err instanceof Error ? err.message : err);
            }
        }

        // Strip prefix from project number — DB stores lowercase, form displays uppercase
        const fullNumber = (r.PROJECT_NUMBER as string) ?? '';
        const dashIdx = fullNumber.indexOf('-');
        const numberWithoutPrefix = dashIdx >= 0 ? fullNumber.slice(dashIdx + 1) : fullNumber;

        const numOrEmpty = (v: unknown) => (v != null && v !== 0 ? v : '');
        const strOrEmpty = (v: unknown) => (v != null ? String(v) : '');
        const numStr = (v: unknown) => (v != null ? String(v) : '');
        // Handles all Snowflake NUMBER return types: JS number 1, string '1', or BigInt
        const boolFlag = (v: unknown) => v === 1 || v === true || v === '1' || Number(v) === 1;

        return NextResponse.json({
            // ── Project tab ──
            projectName: strOrEmpty(r.PROJECT_NAME),
            programAdminId: r.PROGRAM_ADMIN_PROGRAM_ADMIN_ID ?? '',
            projectNumber: numberWithoutPrefix,
            startDate: toISODate(r.PROJECT_START_DATE),
            endDate: toISODate(r.PROJECT_END_DATE),
            projectAwardDate: toISODate(r.PROJECT_AWARD_DATE),
            projectStatus: strOrEmpty(r.PROJECT_STATUS),
            projectPublicUrl: strOrEmpty(r.PROJECT_PUBLIC_URL),
            projectWebsiteUrl: strOrEmpty(r.PROJECT_WEBSITE_ADDRESS_URL),
            standards: boolFlag(r.STANDARDS),
            cyberSecurityConsiderations: boolFlag(r.CYBER_SECURITY_CONSIDERATIONS),
            isEnergyEfficiencyWorkpaperProduced: boolFlag(r.IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED),
            communityBenefits: boolFlag(r.COMMUNITY_BENEFITS),
            cpucDac: boolFlag(r.CPUC_DAC),
            cpucLi: boolFlag(r.CPUC_LI),
            isActive: boolFlag(r.IS_ACTIVE),
            contactFirstName: strOrEmpty(r.PERSON_CONTACT_FIRST_NAME),
            contactLastName: strOrEmpty(r.PERSON_CONTACT_LAST_NAME),
            contactEmail: strOrEmpty(r.PERSON_CONTACT_EMAIL),
            contactTitle: strOrEmpty(r.PERSON_CONTACT_TITLE),
            assemblyDistrictBeforeId: numOrEmpty(r.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_BEFORE_REDISTRICTED_ID),
            assemblyDistrictAfterId: numOrEmpty(r.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID),
            senateDistrictBeforeId: numOrEmpty(r.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_BEFORE_REDISTRICTED_ID),
            senateDistrictAfterId: numOrEmpty(r.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID),
            projectTypeId: numOrEmpty(r.PROJECT_TYPE_PROJECT_TYPE_ID),
            investmentPeriodId: numOrEmpty(r.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID),
            leadCompanyId: numOrEmpty(r.PROJECT_LEAD_COMPANY_ID),
            cecMgrFirstName: strOrEmpty(r.CEC_MGR_CONTACT_FIRST_NAME),
            cecMgrLastName: strOrEmpty(r.CEC_MGR_CONTACT_LAST_NAME),
            cecMgrTitle: strOrEmpty(r.CEC_MGR_CONTACT_TITLE),
            cecMgrPhone: strOrEmpty(r.CEC_MGR_CONTACT_PHONE),
            cecMgrEmail: strOrEmpty(r.CEC_MGR_EMAIL),
            // ── Junction IDs ──
            investmentAreaIds: iaRows.map((x) => x.ID),
            developmentStageIds: dsRows.map((x) => x.ID),
            cpucProceedingIds: cpRows.map((x) => x.ID),
            businessClassificationIds: bcRows.map((x) => x.ID),
            utilityServiceAreaIds: usRows.map((x) => x.ID),
            partnerCompanyIds: partnerRows.map((x) => x.ID),
            fundingMechanismIds: fmRows.map((x) => x.ID),
            confidentialInformationCategoryIds: cicRows.map((x) => x.ID),
            matchFundingPartnerIds: mfpRows.map((x) => x.ID),
            // ── Details tab ──
            detailedDescription: strOrEmpty(r.DETAILED_PROJECT_DESCRIPTION),
            projectSummary: strOrEmpty(r.SUMMARY_PROJECT_DESCRIPTION),
            projectUpdate: strOrEmpty(r.PD_PROJECT_UPDATE),
            deliverables: strOrEmpty(r.DELIVERABLES),
            statePolicySupport: strOrEmpty(r.STATE_POLICY_SUPPORT_TEXT),
            technicalBarriers: strOrEmpty(r.TECHNICAL_BARRIERS),
            marketBarriers: strOrEmpty(r.MARKET_BARRIERS),
            policyAndRegulatoryBarriers: strOrEmpty(r.POLICY_AND_REGULATORY_BARRIERS),
            gettingToScale: strOrEmpty(r.GETTING_TO_SCALE),
            keyInnovations: strOrEmpty(r.KEY_INNOVATIONS),
            keyLearnings: strOrEmpty(r.KEY_LEARNINGS),
            scalability: strOrEmpty(r.SCALABILITY),
            cyberSecurityNarrative: strOrEmpty(r.CYBER_SECURITY_NARRATIVE),
            finalReportUrl: strOrEmpty(r.FINAL_REPORT_URL),
            // ── Finance tab ──
            committedFundingAmt: numStr(r.COMMITED_FUNDING_AMT),
            encumberedFunding: numStr(r.ENCUMBERED_FUNDING_AMT),
            fundsExpended: numStr(r.FUNDS_EXPENDED_TO_DATE),
            adminAndOverheadCost: numStr(r.ADMIN_AND_OVERHEAD_COST),
            numOfBidders: numStr(r.NUM_OF_BIDDERS),
            rankOfSelectedBidders: numStr(r.RANK_OF_SELECTED_BIDDERS),
            contractAmount: numStr(r.CONTRACT_AMOUNT),
            bidderDescription: strOrEmpty(r.BIDDER_DESCRIPTION),
            leveragedFunds: numStr(r.LEVERAGED_FUNDS),
            matchFundingSplit: numStr(r.MATCH_FUNDING_SPLIT),
            // ── Additional Info tab (from PROJECT_METRIC) ──
            ...metricData,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Project GET error:', message);
        return NextResponse.json({ error: 'Failed to load project' }, { status: 500 });
    }
}

// ─── PUT — update project (all tabs) ────────────────────────────────

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];
        if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const userOrg = (session.user as { organization?: string | null }).organization ?? null;
        const t = `${DB}.${SCHEMA}`;
        const projectId = parseInt(id, 10);
        if (isNaN(projectId)) {
            return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
        }

        const existing = (await query(`
            SELECT
                PROGRAM_ADMIN_PROGRAM_ADMIN_ID,
                PROJECT_DETAIL_PROJECT_DETAIL_ID,
                FINANCE_DETAIL_FINANCE_DETAIL_ID,
                PROJECT_METRIC_PROJECT_METRIC_ID
            FROM ${t}.PROJECT WHERE PROJECT_ID = ${projectId}
        `)) as Record<string, number | null>[];

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // The project's true owning org — the ONLY value we'll trust for auth
        // and the ONLY value we'll write back to PROGRAM_ADMIN_PROGRAM_ADMIN_ID.
        const existingProgramAdminId = existing[0].PROGRAM_ADMIN_PROGRAM_ADMIN_ID;

        if (!canEditProject(userOrg, existingProgramAdminId)) {
            return NextResponse.json({ error: 'Forbidden: you do not have permission to edit this project' }, { status: 403 });
        }

        const body = await request.json();
        let pdId = existing[0].PROJECT_DETAIL_PROJECT_DETAIL_ID;
        let fdId = existing[0].FINANCE_DETAIL_FINANCE_DETAIL_ID;
        let pmId = existing[0].PROJECT_METRIC_PROJECT_METRIC_ID;

        const projectNumber = String(body.projectNumber ?? '').toLowerCase();

        // ── Determine the program admin ID to write ──
        // ProgramAdmin users can NEVER change ownership — always pin to the DB's existing value.
        // MasterAdmin users may reassign, but only to a valid ID (otherwise keep existing).
        let programAdminIdToWrite: string;
        if (isMasterAdmin(groups) && body.programAdminId != null && String(body.programAdminId) !== '') {
            programAdminIdToWrite = safeIntOrNull(body.programAdminId);
        } else {
            programAdminIdToWrite = existingProgramAdminId != null ? String(existingProgramAdminId) : 'NULL';
        }

        // ── Update PROJECT row ──
        await query(`
            UPDATE ${t}.PROJECT SET
                PROJECT_NUMBER = '${safeStr(projectNumber)}',
                PROJECT_NAME = '${safeStr(body.projectName)}',
                PROJECT_STATUS = '${safeStr(body.projectStatus)}',
                PROGRAM_ADMIN_PROGRAM_ADMIN_ID = ${programAdminIdToWrite},
                PROJECT_TYPE_PROJECT_TYPE_ID = ${safeIntOrNull(body.projectTypeId)},
                INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ${safeIntOrNull(body.investmentPeriodId)},
                PROJECT_START_DATE = ${safeDateOrNull(body.startDate)},
                PROJECT_END_DATE = ${safeDateOrNull(body.endDate)},
                PROJECT_AWARD_DATE = ${safeDateOrNull(body.projectAwardDate)},
                PROJECT_PUBLIC_URL = '${safeStr(body.projectPublicUrl)}',
                PROJECT_WEBSITE_ADDRESS_URL = '${safeStr(body.projectWebsiteUrl)}',
                STANDARDS = ${body.standards ? 1 : 0},
                CYBER_SECURITY_CONSIDERATIONS = ${body.cyberSecurityConsiderations ? 1 : 0},
                IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED = ${body.isEnergyEfficiencyWorkpaperProduced ? 1 : 0},
                COMMUNITY_BENEFITS = ${body.communityBenefits ? 1 : 0},
                CPUC_DAC = ${body.cpucDac ? 1 : 0},
                CPUC_LI = ${body.cpucLi ? 1 : 0},
                IS_ACTIVE = ${body.isActive === false ? 0 : 1},
                PERSON_CONTACT_FIRST_NAME = '${safeStr(body.contactFirstName)}',
                PERSON_CONTACT_LAST_NAME = '${safeStr(body.contactLastName)}',
                PERSON_CONTACT_EMAIL = '${safeStr(body.contactEmail)}',
                PERSON_CONTACT_TITLE = '${safeStr(body.contactTitle)}',
                CEC_MGR_CONTACT_FIRST_NAME = '${safeStr(body.cecMgrFirstName)}',
                CEC_MGR_CONTACT_LAST_NAME = '${safeStr(body.cecMgrLastName)}',
                CEC_MGR_CONTACT_TITLE = '${safeStr(body.cecMgrTitle)}',
                CEC_MGR_CONTACT_PHONE = '${safeStr(body.cecMgrPhone)}',
                CEC_MGR_EMAIL = '${safeStr(body.cecMgrEmail)}',
                PROJECT_LEAD_COMPANY_ID = ${safeIntOrNull(body.leadCompanyId)},
                LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_BEFORE_REDISTRICTED_ID = ${safeIntOrNull(body.assemblyDistrictBeforeId)},
                LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID = ${safeIntOrNull(body.assemblyDistrictAfterId)},
                LEGISLATIVE_DISTRICT_SENATE_DISTRICT_BEFORE_REDISTRICTED_ID = ${safeIntOrNull(body.senateDistrictBeforeId)},
                LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID = ${safeIntOrNull(body.senateDistrictAfterId)},
                MODIFIED_DATE = CURRENT_TIMESTAMP()
            WHERE PROJECT_ID = ${projectId}
        `);

        // ── Upsert PROJECT_DETAIL ──
        if (pdId == null) {
            await query(`INSERT INTO ${t}.PROJECT_DETAIL (IS_ACTIVE) VALUES (1)`);
            const pdIdRows = (await query(`SELECT MAX(PROJECT_DETAIL_ID) AS ID FROM ${t}.PROJECT_DETAIL`)) as { ID: number }[];
            pdId = pdIdRows[0]?.ID ?? null;
            if (pdId) {
                await query(`UPDATE ${t}.PROJECT SET PROJECT_DETAIL_PROJECT_DETAIL_ID = ${pdId} WHERE PROJECT_ID = ${projectId}`);
            }
        }
        if (pdId != null) {
            await query(`
                UPDATE ${t}.PROJECT_DETAIL SET
                    DETAILED_PROJECT_DESCRIPTION = '${safeStr(body.detailedDescription)}',
                    SUMMARY_PROJECT_DESCRIPTION = '${safeStr(body.projectSummary)}',
                    PROJECT_UPDATE = '${safeStr(body.projectUpdate)}',
                    DELIVERABLES = '${safeStr(body.deliverables)}',
                    STATE_POLICY_SUPPORT_TEXT = '${safeStr(body.statePolicySupport)}',
                    TECHNICAL_BARRIERS = '${safeStr(body.technicalBarriers)}',
                    MARKET_BARRIERS = '${safeStr(body.marketBarriers)}',
                    POLICY_AND_REGULATORY_BARRIERS = '${safeStr(body.policyAndRegulatoryBarriers)}',
                    GETTING_TO_SCALE = '${safeStr(body.gettingToScale)}',
                    KEY_INNOVATIONS = '${safeStr(body.keyInnovations)}',
                    KEY_LEARNINGS = '${safeStr(body.keyLearnings)}',
                    SCALABILITY = '${safeStr(body.scalability)}',
                    CYBER_SECURITY_NARRATIVE = '${safeStr(body.cyberSecurityNarrative)}',
                    FINAL_REPORT_URL = '${safeStr(body.finalReportUrl)}',
                    MODIFIED_DATE = CURRENT_TIMESTAMP()
                WHERE PROJECT_DETAIL_ID = ${pdId}
            `);
        }

        // ── Upsert FINANCE_DETAIL ──
        if (fdId == null) {
            await query(`INSERT INTO ${t}.FINANCE_DETAIL (IS_ACTIVE) VALUES (1)`);
            const fdIdRows = (await query(`SELECT MAX(FINANCE_DETAIL_ID) AS ID FROM ${t}.FINANCE_DETAIL`)) as { ID: number }[];
            fdId = fdIdRows[0]?.ID ?? null;
            if (fdId) {
                await query(`UPDATE ${t}.PROJECT SET FINANCE_DETAIL_FINANCE_DETAIL_ID = ${fdId} WHERE PROJECT_ID = ${projectId}`);
            }
        }
        if (fdId != null) {
            await query(`
                UPDATE ${t}.FINANCE_DETAIL SET
                    COMMITED_FUNDING_AMT = ${safeFloatOrNull(body.committedFundingAmt)},
                    ENCUMBERED_FUNDING_AMT = ${safeFloatOrNull(body.encumberedFunding)},
                    FUNDS_EXPENDED_TO_DATE = ${safeFloatOrNull(body.fundsExpended)},
                    ADMIN_AND_OVERHEAD_COST = ${safeFloatOrNull(body.adminAndOverheadCost)},
                    NUM_OF_BIDDERS = ${safeIntOrNull(body.numOfBidders)},
                    RANK_OF_SELECTED_BIDDERS = ${safeIntOrNull(body.rankOfSelectedBidders)},
                    CONTRACT_AMOUNT = ${safeFloatOrNull(body.contractAmount)},
                    BIDDER_DESCRIPTION = '${safeStr(body.bidderDescription)}',
                    LEVERAGED_FUNDS = ${safeFloatOrNull(body.leveragedFunds)},
                    MATCH_FUNDING_SPLIT = ${safeFloatOrNull(body.matchFundingSplit)},
                    MODIFIED_DATE = CURRENT_TIMESTAMP()
                WHERE FINANCE_DETAIL_ID = ${fdId}
            `);
        }

        // ── Upsert PROJECT_METRIC ──
        if (pmId == null) {
            await query(`INSERT INTO ${t}.PROJECT_METRIC (IS_ACTIVE) VALUES (1)`);
            const pmIdRows = (await query(`SELECT MAX(PROJECT_METRIC_ID) AS ID FROM ${t}.PROJECT_METRIC`)) as { ID: number }[];
            pmId = pmIdRows[0]?.ID ?? null;
            if (pmId) {
                await query(`UPDATE ${t}.PROJECT SET PROJECT_METRIC_PROJECT_METRIC_ID = ${pmId} WHERE PROJECT_ID = ${projectId}`);
            }
        }
        if (pmId != null) {
            await query(`
                UPDATE ${t}.PROJECT_METRIC SET
                    ELECTRICITY_SYSTEM_RELIABILITY_IMPACTS = '${safeStr(body.electricitySystemReliabilityImpact)}',
                    ELECTRICITY_SYSTEM_SAFETY_IMPACTS = '${safeStr(body.electricitySystemSafetyImpact)}',
                    GHG_IMPACTS = '${safeStr(body.ghgImpacts)}',
                    ENVIRONMENTAL_IMPACTS_NON_GHG = '${safeStr(body.environmentalImpactNonGhg)}',
                    PROJECTED_PROJECT_BENEFITS = '${safeStr(body.projectedProjectBenefits)}',
                    RATEPAYERS_BENEFITS = '${safeStr(body.ratepayersBenefits)}',
                    COMMUNITY_BENEFITS_DESC = '${safeStr(body.communityBenefitsDesc)}',
                    ENERGY_IMPACTS = '${safeStr(body.energyImpact)}',
                    INFRASTRUCTURE_COST_REDUCTIONS_AND_ECONOMIC_BENEFITS = '${safeStr(body.infrastructureCostReductions)}',
                    OTHER_IMPACTS = '${safeStr(body.otherImpacts)}',
                    INFORMATION_DISSEMINATION = '${safeStr(body.informationDissemination)}',
                    MODIFIED_DATE = CURRENT_TIMESTAMP()
                WHERE PROJECT_METRIC_ID = ${pmId}
            `);
        }

        // ── Sync junction tables ──
        const syncJunction = async (
            table: string,
            fkCol: string,
            fkVal: number,
            valCol: string,
            ids: number[],
        ) => {
            await query(`DELETE FROM ${t}.${table} WHERE ${fkCol} = ${fkVal}`);
            for (const valId of ids ?? []) {
                await query(`
                    INSERT INTO ${t}.${table} (${fkCol}, ${valCol}, CREATE_DATE, MODIFIED_DATE, IS_ACTIVE)
                    VALUES (${fkVal}, ${parseInt(String(valId), 10)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
                `);
            }
        };

        await syncJunction('PROJECT_HAS_INVESTMENT_AREA',   'PROJECT_PROJECT_ID', projectId, 'INVESTMENT_AREA_INVESTMENT_AREA_ID',     body.investmentAreaIds ?? []);
        await syncJunction('PROJECT_HAS_DEVELOPMENT_STAGE', 'PROJECT_PROJECT_ID', projectId, 'DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID', body.developmentStageIds ?? []);
        await syncJunction('PROJECT_HAS_CPUC_PROCEEDING',   'PROJECT_PROJECT_ID', projectId, 'CPUC_PROCEEDING_CPUC_PROCEEDING_ID',     body.cpucProceedingIds ?? []);

        if (pdId != null) {
            await syncJunction('PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION', 'PROJECT_DETAIL_PROJECT_DETAIL_ID', pdId, 'BUSINESS_CLASSIFICATION_BUSINESS_CLASSIFICATION_ID', body.businessClassificationIds ?? []);
            await syncJunction('PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA',    'PROJECT_DETAIL_PROJECT_DETAIL_ID', pdId, 'UTILITY_SERVICE_AREA_UTILITY_SERVICE_AREA_ID',       body.utilityServiceAreaIds ?? []);
            await syncJunction('PROJECT_DETAIL_HAS_PARTNER',                 'PROJECT_DETAIL_PROJECT_DETAIL_ID', pdId, 'COMPANY_COMPANY_ID',                                 body.partnerCompanyIds ?? []);
        }

        if (fdId != null) {
            await syncJunction('FINANCE_DETAIL_HAS_FUNDING_MECHANISM',     'FINANCE_DETAIL_FINANCE_DETAIL_ID', fdId, 'FUNDING_MECHANISM_FUNDING_MECHANISM_ID', body.fundingMechanismIds ?? []);
            await syncJunction('FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER', 'FINANCE_DETAIL_FINANCE_DETAIL_ID', fdId, 'COMPANY_COMPANY_ID',                     body.matchFundingPartnerIds ?? []);
        }

        if (pmId != null) {
            await syncJunction('PROJECT_METRIC_HAS_CIC', 'PROJECT_METRIC_PROJECT_METRIC_ID', pmId, 'CONFIDENTIAL_INFORMATION_CATEGORY_CIC_ID', body.confidentialInformationCategoryIds ?? []);
        }

        return NextResponse.json({ success: true, projectId });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Project PUT error:', message);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}