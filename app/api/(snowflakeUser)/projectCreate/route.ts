//app/api/(snowflakeUser)/projectCreate/route.ts
//
// CHANGED for quarterly finance records:
//   • The create form stages quarterly records locally and submits them as
//     body.quarters[] ({ reportingYear, reportingQuarter, ...values }).
//     The NEWEST staged quarter becomes the FINANCE_DETAIL row; any others
//     are inserted into FINANCE_DETAIL_HISTORY. Duplicate periods rejected.
//   • Backward compatible: if body.quarters is absent/empty, falls back to
//     the flat fields stamped with the current calendar quarter.
//   • MATCH_FUNDING is now inserted from the form.
//   • MATCH_FUNDING_SPLIT is computed server-side:
//       match ÷ (match + committed) — no longer trusted from the client.

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/snowflake';
import { canEditProject } from '@/lib/permissions';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

function safeStr(v: unknown): string {
    return String(v ?? '').replace(/'/g, "''");
}
function safeIntOrNull(v: unknown): string {
    if (v === '' || v === null || v === undefined) return 'NULL';
    const n = parseInt(String(v), 10);
    return isNaN(n) ? 'NULL' : String(n);
}

function safeDateOrNull(v: unknown): string {
    if (!v || v === '') return 'NULL';
    return `'${safeStr(v)}'`;
}


const FINANCE_MAX = 999_999_999_999.999;


const PROJECT_NUMBER_MAX = 32;
function safeFinanceOrNull(v: unknown, fieldName: string): string {
    if (v === '' || v === null || v === undefined) return 'NULL';
    const n = parseFloat(String(v).replace(/[$,]/g, ''));
    if (!Number.isFinite(n)) return 'NULL';
    if (Math.abs(n) > FINANCE_MAX) {
        throw new Error(`${fieldName} exceeds the maximum value of $999,999,999,999.`);
    }
    return String(n);
}

function computeMatchSplit(matchFunding: string, committed: string): string {
    if (matchFunding === 'NULL' || committed === 'NULL') return 'NULL';
    const m = parseFloat(matchFunding);
    const c = parseFloat(committed);
    if (!Number.isFinite(m) || !Number.isFinite(c) || m + c === 0) return 'NULL';
    return (m / (m + c)).toFixed(6);
}


interface ParsedQuarter {
    year: number;
    quarter: number;
    committedFundingAmt: string;
    encumberedFunding: string;
    fundsExpended: string;
    adminAndOverheadCost: string;
    matchFunding: string;
    contractAmount: string;
    leveragedFunds: string;
    matchFundingSplit: string;
}

function parseQuarter(q: Record<string, unknown>): ParsedQuarter {
    const year = parseInt(String(q.reportingYear), 10);
    const quarter = parseInt(String(q.reportingQuarter), 10);
    if (!Number.isFinite(year) || year < 2000 || year > 2100 ||
        !Number.isFinite(quarter) || quarter < 1 || quarter > 4) {
        throw new Error('Each quarterly record needs a valid reporting year and quarter (1–4).');
    }
    const committedFundingAmt = safeFinanceOrNull(q.committedFundingAmt, 'Committed funding amount');
    const matchFunding = safeFinanceOrNull(q.matchFunding, 'Match funding');
    return {
        year, quarter,
        committedFundingAmt,
        encumberedFunding: safeFinanceOrNull(q.encumberedFunding, 'Encumbered funding'),
        fundsExpended: safeFinanceOrNull(q.fundsExpended, 'Funds expended'),
        adminAndOverheadCost: safeFinanceOrNull(q.adminAndOverheadCost, 'Admin & overhead cost'),
        matchFunding,
        contractAmount: safeFinanceOrNull(q.contractAmount, 'Contract amount'),
        leveragedFunds: safeFinanceOrNull(q.leveragedFunds, 'Leveraged funds'),
        matchFundingSplit: computeMatchSplit(matchFunding, committedFundingAmt),
    };
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userOrg = (session.user as { organization?: string | null }).organization ?? null;
        const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];

        if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const t = `${DB}.${SCHEMA}`;

        const programAdminId = body.programAdminId != null ? parseInt(String(body.programAdminId), 10) : null;

        if (!canEditProject(userOrg, programAdminId)) {
            return NextResponse.json(
                { error: 'Forbidden: you cannot create projects for this administrator' },
                { status: 403 },
            );
        }

        // Project number is displayed uppercase in the UI but stored lowercase in the DB
        const projectNumber = String(body.projectNumber ?? '').toLowerCase();

        // Enforce 32-char cap on the full project number (prefix + dash + number).
        // Matches the client-side limit in components/project_forms/types.ts.
        if (projectNumber.length > PROJECT_NUMBER_MAX) {
            return NextResponse.json(
                { error: `Project number cannot exceed ${PROJECT_NUMBER_MAX} characters.` },
                { status: 400 },
            );
        }

        // isActive: true → IS_ACTIVE = 1 (visible), false → IS_ACTIVE = 0 (hidden)
        // Defaults to 1 if not provided (safe default for existing callers).
        const isActiveInt = body.isActive === false ? 0 : 1;

        // ── One sequence value, shared across all four related tables ──
        const seqRows = (await query(
            `SELECT ${DB}.${SCHEMA}.PROJECT_ID_SEQ.NEXTVAL AS ID`
        )) as { ID: number }[];
        const sharedId = seqRows[0].ID;

        // ── Create FINANCE_DETAIL (+ FINANCE_DETAIL_HISTORY for extra quarters) ──
        // The create form stages quarters in body.quarters[]. The NEWEST one
        // becomes the FINANCE_DETAIL row (the current quarter); any others are
        // inserted into FINANCE_DETAIL_HISTORY. If no quarters were staged,
        // fall back to the flat fields stamped with the current calendar quarter.
        const rawQuarters: Record<string, unknown>[] = Array.isArray(body.quarters) ? body.quarters : [];
        let parsedQuarters = rawQuarters.map(parseQuarter);

        // One entry per quarter — reject duplicates in the payload.
        const seen = new Set<string>();
        for (const q of parsedQuarters) {
            const key = `${q.year}-Q${q.quarter}`;
            if (seen.has(key)) {
                return NextResponse.json(
                    { error: `Duplicate quarterly record for Q${q.quarter} ${q.year}.` },
                    { status: 400 },
                );
            }
            seen.add(key);
        }

        if (parsedQuarters.length === 0) {
            // Backward-compatible fallback: flat fields = current calendar quarter.
            const now = new Date();
            parsedQuarters = [parseQuarter({
                reportingYear: now.getFullYear(),
                reportingQuarter: Math.floor(now.getMonth() / 3) + 1,
                committedFundingAmt: body.committedFundingAmt,
                encumberedFunding: body.encumberedFunding,
                fundsExpended: body.fundsExpended,
                adminAndOverheadCost: body.adminAndOverheadCost,
                matchFunding: body.matchFunding,
                contractAmount: body.contractAmount,
                leveragedFunds: body.leveragedFunds,
            })];
        }

        // Newest first — index 0 becomes FINANCE_DETAIL, the rest go to history.
        parsedQuarters.sort((a, b) => (b.year * 4 + b.quarter) - (a.year * 4 + a.quarter));
        const [currentQ, ...priorQs] = parsedQuarters;

        await query(`
            INSERT INTO ${t}.FINANCE_DETAIL (
                FINANCE_DETAIL_ID,
                REPORTING_YEAR, REPORTING_QUARTER,
                COMMITED_FUNDING_AMT, ENCUMBERED_FUNDING_AMT, FUNDS_EXPENDED_TO_DATE,
                ADMIN_AND_OVERHEAD_COST, MATCH_FUNDING, NUM_OF_BIDDERS, RANK_OF_SELECTED_BIDDERS,
                CONTRACT_AMOUNT, BIDDER_DESCRIPTION, LEVERAGED_FUNDS, MATCH_FUNDING_SPLIT,
                CREATE_DATE, MODIFIED_DATE, IS_ACTIVE
            ) VALUES (
                ${sharedId},
                ${currentQ.year}, ${currentQ.quarter},
                ${currentQ.committedFundingAmt},
                ${currentQ.encumberedFunding},
                ${currentQ.fundsExpended},
                ${currentQ.adminAndOverheadCost},
                ${currentQ.matchFunding},
                ${safeIntOrNull(body.numOfBidders)},
                ${safeIntOrNull(body.rankOfSelectedBidders)},
                ${currentQ.contractAmount},
                '${safeStr(body.bidderDescription)}',
                ${currentQ.leveragedFunds},
                ${currentQ.matchFundingSplit},
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1
            )
        `);

        // Prior quarters → FINANCE_DETAIL_HISTORY (bidder info intentionally
        // not duplicated — it lives only in FINANCE_DETAIL).
        for (const q of priorQs) {
            await query(`
                INSERT INTO ${t}.FINANCE_DETAIL_HISTORY (
                    FINANCE_DETAIL_ID, REPORTING_YEAR, REPORTING_QUARTER,
                    COMMITED_FUNDING_AMT, ENCUMBERED_FUNDING_AMT, FUNDS_EXPENDED_TO_DATE,
                    ADMIN_AND_OVERHEAD_COST, MATCH_FUNDING, CONTRACT_AMOUNT,
                    LEVERAGED_FUNDS, MATCH_FUNDING_SPLIT, CREATE_DATE, MODIFIED_DATE
                ) VALUES (
                    ${sharedId}, ${q.year}, ${q.quarter},
                    ${q.committedFundingAmt}, ${q.encumberedFunding}, ${q.fundsExpended},
                    ${q.adminAndOverheadCost}, ${q.matchFunding}, ${q.contractAmount},
                    ${q.leveragedFunds}, ${q.matchFundingSplit},
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            `);
        }

        // ── Create PROJECT_DETAIL ──
        await query(`
            INSERT INTO ${t}.PROJECT_DETAIL (
                PROJECT_DETAIL_ID,
                DETAILED_PROJECT_DESCRIPTION, SUMMARY_PROJECT_DESCRIPTION, PROJECT_UPDATE,
                DELIVERABLES, STATE_POLICY_SUPPORT_TEXT, TECHNICAL_BARRIERS, MARKET_BARRIERS,
                POLICY_AND_REGULATORY_BARRIERS, GETTING_TO_SCALE, KEY_INNOVATIONS,
                KEY_LEARNINGS, SCALABILITY, CYBER_SECURITY_NARRATIVE, FINAL_REPORT_URL,
                CREATE_DATE, MODIFIED_DATE, IS_ACTIVE
            ) VALUES (
                ${sharedId},
                '${safeStr(body.detailedDescription)}',
                '${safeStr(body.projectSummary)}',
                '${safeStr(body.projectUpdate)}',
                '${safeStr(body.deliverables)}',
                '${safeStr(body.statePolicySupport)}',
                '${safeStr(body.technicalBarriers)}',
                '${safeStr(body.marketBarriers)}',
                '${safeStr(body.policyAndRegulatoryBarriers)}',
                '${safeStr(body.gettingToScale)}',
                '${safeStr(body.keyInnovations)}',
                '${safeStr(body.keyLearnings)}',
                '${safeStr(body.scalability)}',
                '${safeStr(body.cyberSecurityNarrative)}',
                '${safeStr(body.finalReportUrl)}',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1
            )
        `);

        // ── Create PROJECT_METRIC ──
        await query(`
            INSERT INTO ${t}.PROJECT_METRIC (
                PROJECT_METRIC_ID,
                ELECTRICITY_SYSTEM_RELIABILITY_IMPACTS, ELECTRICITY_SYSTEM_SAFETY_IMPACTS,
                GHG_IMPACTS, ENVIRONMENTAL_IMPACTS_NON_GHG, PROJECTED_PROJECT_BENEFITS,
                RATEPAYERS_BENEFITS, COMMUNITY_BENEFITS_DESC, ENERGY_IMPACTS,
                INFRASTRUCTURE_COST_REDUCTIONS_AND_ECONOMIC_BENEFITS,
                OTHER_IMPACTS, INFORMATION_DISSEMINATION,
                CREATE_DATE, MODIFIED_DATE, IS_ACTIVE
            ) VALUES (
                ${sharedId},
                '${safeStr(body.electricitySystemReliabilityImpact)}',
                '${safeStr(body.electricitySystemSafetyImpact)}',
                '${safeStr(body.ghgImpacts)}',
                '${safeStr(body.environmentalImpactNonGhg)}',
                '${safeStr(body.projectedProjectBenefits)}',
                '${safeStr(body.ratepayersBenefits)}',
                '${safeStr(body.communityBenefitsDesc)}',
                '${safeStr(body.energyImpact)}',
                '${safeStr(body.infrastructureCostReductions)}',
                '${safeStr(body.otherImpacts)}',
                '${safeStr(body.informationDissemination)}',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1
            )
        `);

        // ── Create PROJECT ──

        await query(`
            INSERT INTO ${t}.PROJECT (
                PROJECT_ID,
                PROJECT_NUMBER, PROJECT_NAME, PROJECT_STATUS,
                PROGRAM_ADMIN_PROGRAM_ADMIN_ID, PROJECT_TYPE_PROJECT_TYPE_ID,
                INVESTMENT_PROGRAM_PERIOD_PERIOD_ID,
                PROJECT_START_DATE, PROJECT_END_DATE, PROJECT_AWARD_DATE,
                PROJECT_PUBLIC_URL, PROJECT_WEBSITE_ADDRESS_URL,
                STANDARDS, CYBER_SECURITY_CONSIDERATIONS,
                IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED,
                COMMUNITY_BENEFITS, CPUC_DAC, CPUC_LI,
                PERSON_CONTACT_FIRST_NAME, PERSON_CONTACT_LAST_NAME,
                PERSON_CONTACT_EMAIL, PERSON_CONTACT_TITLE,
                CEC_MGR_CONTACT_FIRST_NAME, CEC_MGR_CONTACT_LAST_NAME,
                CEC_MGR_CONTACT_TITLE, CEC_MGR_CONTACT_PHONE, CEC_MGR_EMAIL,
                PROJECT_LEAD_COMPANY_ID,
                LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_BEFORE_REDISTRICTED_ID,
                LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID,
                LEGISLATIVE_DISTRICT_SENATE_DISTRICT_BEFORE_REDISTRICTED_ID,
                LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID,
                FINANCE_DETAIL_FINANCE_DETAIL_ID,
                PROJECT_DETAIL_PROJECT_DETAIL_ID,
                PROJECT_METRIC_PROJECT_METRIC_ID,
                CREATE_DATE, MODIFIED_DATE, IS_ACTIVE, SOURCE_SYSTEM
            ) VALUES (
                ${sharedId},
                '${safeStr(projectNumber)}',
                '${safeStr(body.projectName)}',
                '${safeStr(body.projectStatus)}',
                ${safeIntOrNull(programAdminId)},
                ${safeIntOrNull(body.projectTypeId)},
                ${safeIntOrNull(body.investmentPeriodId)},
                ${safeDateOrNull(body.startDate)},
                ${safeDateOrNull(body.endDate)},
                ${safeDateOrNull(body.projectAwardDate)},
                '${safeStr(body.projectPublicUrl)}',
                '${safeStr(body.projectWebsiteUrl)}',
                ${body.standards ? 1 : 0},
                ${body.cyberSecurityConsiderations ? 1 : 0},
                ${body.isEnergyEfficiencyWorkpaperProduced ? 1 : 0},
                ${body.communityBenefits ? 1 : 0},
                ${body.cpucDac ? 1 : 0},
                ${body.cpucLi ? 1 : 0},
                '${safeStr(body.contactFirstName)}',
                '${safeStr(body.contactLastName)}',
                '${safeStr(body.contactEmail)}',
                '${safeStr(body.contactTitle)}',
                '${safeStr(body.cecMgrFirstName)}',
                '${safeStr(body.cecMgrLastName)}',
                '${safeStr(body.cecMgrTitle)}',
                '${safeStr(body.cecMgrPhone)}',
                '${safeStr(body.cecMgrEmail)}',
                ${safeIntOrNull(body.leadCompanyId)},
                ${safeIntOrNull(body.assemblyDistrictBeforeId)},
                ${safeIntOrNull(body.assemblyDistrictAfterId)},
                ${safeIntOrNull(body.senateDistrictBeforeId)},
                ${safeIntOrNull(body.senateDistrictAfterId)},
                ${sharedId},
                ${sharedId},
                ${sharedId},
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${isActiveInt}, 'EPIC'
            )
        `);

        const insertJunction = async (
            table: string,
            fkCol: string,
            fkVal: number,
            valCol: string,
            ids: unknown[],
        ) => {
            for (const valId of ids ?? []) {
                await query(`
                    INSERT INTO ${t}.${table} (${fkCol}, ${valCol}, CREATE_DATE, MODIFIED_DATE, IS_ACTIVE)
                    VALUES (${fkVal}, ${parseInt(String(valId), 10)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
                `);
            }
        };

        await insertJunction('PROJECT_HAS_INVESTMENT_AREA',   'PROJECT_PROJECT_ID', sharedId, 'INVESTMENT_AREA_INVESTMENT_AREA_ID',     body.investmentAreaIds);
        await insertJunction('PROJECT_HAS_DEVELOPMENT_STAGE', 'PROJECT_PROJECT_ID', sharedId, 'DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID', body.developmentStageIds);
        await insertJunction('PROJECT_HAS_CPUC_PROCEEDING',   'PROJECT_PROJECT_ID', sharedId, 'CPUC_PROCEEDING_CPUC_PROCEEDING_ID',     body.cpucProceedingIds);

        await insertJunction('PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION', 'PROJECT_DETAIL_PROJECT_DETAIL_ID', sharedId, 'BUSINESS_CLASSIFICATION_BUSINESS_CLASSIFICATION_ID', body.businessClassificationIds);
        await insertJunction('PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA',    'PROJECT_DETAIL_PROJECT_DETAIL_ID', sharedId, 'UTILITY_SERVICE_AREA_UTILITY_SERVICE_AREA_ID',       body.utilityServiceAreaIds);
        await insertJunction('PROJECT_DETAIL_HAS_PARTNER',                 'PROJECT_DETAIL_PROJECT_DETAIL_ID', sharedId, 'COMPANY_COMPANY_ID',                                 body.partnerCompanyIds);

        await insertJunction('FINANCE_DETAIL_HAS_FUNDING_MECHANISM',     'FINANCE_DETAIL_FINANCE_DETAIL_ID', sharedId, 'FUNDING_MECHANISM_FUNDING_MECHANISM_ID', body.fundingMechanismIds);
        await insertJunction('FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER', 'FINANCE_DETAIL_FINANCE_DETAIL_ID', sharedId, 'COMPANY_COMPANY_ID',                     body.matchFundingPartnerIds);

        await insertJunction('PROJECT_METRIC_HAS_CIC', 'PROJECT_METRIC_PROJECT_METRIC_ID', sharedId, 'CONFIDENTIAL_INFORMATION_CATEGORY_CIC_ID', body.confidentialInformationCategoryIds);

        return NextResponse.json({ success: true, projectId: sharedId });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Project POST error:', message);
        const isValidation = message.includes('exceeds the maximum value');
        return NextResponse.json(
            { error: isValidation ? message : 'Failed to create project' },
            { status: isValidation ? 400 : 500 },
        );
    }
}