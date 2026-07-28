// app/api/(snowflakeUser)/(snowflakeDashboard)/(master)/compliance/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/snowflake';

import type { ComplianceApiResponse, ComplianceProject } from '@/components/dashboard/compliance';
import { scoreProjectNarratives } from '@/components/dashboard/compliance/comprehensivenessRubric';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;


type Row = Record<string, unknown>;

function toRows(result: unknown): Row[] {
    if (!Array.isArray(result)) return [];
    return result.map((r) => (r !== null && typeof r === 'object' ? (r as Row) : {}));
}

function pick(r: Row, key: string): unknown {
    if (key in r) return r[key];
    const lower = key.toLowerCase();
    if (lower in r) return r[lower];
    return undefined;
}

const num = (v: unknown): number => (v != null ? Number(v) : 0);
const str = (v: unknown): string => (v != null ? String(v) : '');


function hasText(v: unknown): boolean {
    if (v == null) return false;
    return String(v).trim().length > 0;
}


function hasNumber(v: unknown): boolean {
    if (v == null || v === '') return false;
    return Number.isFinite(Number(v));
}

function hasDate(v: unknown): boolean {
    if (v == null || v === '') return false;
    if (v instanceof Date) return !isNaN(v.getTime());
    return hasText(v);
}


function hasFlagAnswer(v: unknown): boolean {
    if (v == null || v === '') return false;
    if (v === true || v === false || v === 1 || v === 0) return true;
    const s = String(v).trim();
    return s === '0' || s === '1' || s.toLowerCase() === 'true' || s.toLowerCase() === 'false';
}

function toIso(v: unknown): string | null {
    if (v == null || v === '') return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString();
    const s = String(v);
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toISOString();
}

// PROGRAM_ADMIN_ID → human-readable name fallback.
const ADMIN_ID_TO_NAME: Record<number, string> = {
    0: 'California Energy Commission',
    1: 'Southern California Edison',
    2: 'San Diego Gas & Electric',
    3: 'Pacific Gas & Electric',
};

// ── Route ────────────────────────────────────────────────────────────

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];
        if (!groups.includes('MasterAdmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const t = `${DB}.${SCHEMA}`;

        const [
            projectQueryResult,
            invAreaCounts,
            devStageCounts,
            cpucProcCounts,
            partnerCounts,
            matchPartnerCounts,
            cicCounts,
            buClassCounts,
            utilSvcCounts,
        ] = await Promise.all([
            query(`
                SELECT
                    p.PROJECT_ID,
                    p.PROJECT_NUMBER,
                    p.PROJECT_NAME,
                    p.PROJECT_STATUS,
                    p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID  AS PROGRAM_ADMIN_ID,
                    pa.PROGRAM_ADMIN_NAME             AS PROGRAM_ADMIN_NAME,
                    p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID AS PERIOD_ID,
                    ipp.PERIOD_NAME                   AS PERIOD_NAME,
                    p.PROJECT_LEAD_COMPANY_ID,
                    p.PROJECT_TYPE_PROJECT_TYPE_ID    AS PROJECT_TYPE_ID,

                    -- Project-side person contact (this is the project lead's contact)
                    p.PERSON_CONTACT_FIRST_NAME,
                    p.PERSON_CONTACT_LAST_NAME,
                    p.PERSON_CONTACT_EMAIL,

                    -- CEC / IOU manager contact (the administrator's project manager)
                    p.CEC_MGR_CONTACT_FIRST_NAME,
                    p.CEC_MGR_CONTACT_LAST_NAME,
                    p.CEC_MGR_EMAIL,

                    p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_AFTER_REDISTRICTED_ID  AS ASSEMBLY_DISTRICT_AFTER_ID,
                    p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_BEFORE_REDISTRICTED_ID AS ASSEMBLY_DISTRICT_BEFORE_ID,
                    p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_AFTER_REDISTRICTED_ID    AS SENATE_DISTRICT_AFTER_ID,
                    p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_BEFORE_REDISTRICTED_ID   AS SENATE_DISTRICT_BEFORE_ID,
                    p.PROJECT_START_DATE,
                    p.PROJECT_END_DATE,
                    p.PROJECT_AWARD_DATE,
                    p.STANDARDS,
                    p.CYBER_SECURITY_CONSIDERATIONS,
                    p.IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED,
                    p.COMMUNITY_BENEFITS,
                    p.CPUC_DAC,
                    p.CPUC_LI,
                    p.CPUC_DACLI,
                    p.MODIFIED_DATE,

                    -- PROJECT_DETAIL
                    pd.DETAILED_PROJECT_DESCRIPTION,
                    pd.SUMMARY_PROJECT_DESCRIPTION,
                    pd.PROJECT_GOALS,
                    pd.PROJECT_UPDATE,
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
                    fd.CONTRACT_AMOUNT,
                    fd.LEVERAGED_FUNDS,
                    fd.MATCH_FUNDING,
                    fd.MATCH_FUNDING_SPLIT,

                    -- PROJECT_METRIC
                    pm.ELECTRICITY_SYSTEM_RELIABILITY_IMPACTS,
                    pm.ELECTRICITY_SYSTEM_SAFETY_IMPACTS,
                    pm.GHG_IMPACTS,
                    pm.ENVIRONMENTAL_IMPACTS_NON_GHG,
                    pm.PROJECTED_PROJECT_BENEFITS,
                    pm.RATEPAYERS_BENEFITS,
                    pm.COMMUNITY_BENEFITS_DESC,
                    pm.ENERGY_IMPACTS,
                    pm.INFRASTRUCTURE_COST_REDUCTIONS_AND_ECONOMIC_BENEFITS,
                    pm.OTHER_IMPACTS,
                    pm.INFORMATION_DISSEMINATION
                FROM ${t}.PROJECT p
                LEFT JOIN ${t}.PROJECT_DETAIL pd
                    ON pd.PROJECT_DETAIL_ID = p.PROJECT_DETAIL_PROJECT_DETAIL_ID
                LEFT JOIN ${t}.FINANCE_DETAIL fd
                    ON fd.FINANCE_DETAIL_ID = p.FINANCE_DETAIL_FINANCE_DETAIL_ID
                LEFT JOIN ${t}.PROJECT_METRIC pm
                    ON pm.PROJECT_METRIC_ID = p.PROJECT_METRIC_PROJECT_METRIC_ID
                LEFT JOIN ${t}.PROGRAM_ADMIN pa
                    ON pa.PROGRAM_ADMIN_ID = p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID
                LEFT JOIN ${t}.INVESTMENT_PROGRAM_PERIOD ipp
                    ON ipp.PERIOD_ID = p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID
                WHERE COALESCE(p.IS_ACTIVE, 1) = 1
                ORDER BY p.PROJECT_ID DESC
            `),
            query(`SELECT PROJECT_PROJECT_ID AS PROJECT_ID, COUNT(*) AS CNT FROM ${t}.PROJECT_HAS_INVESTMENT_AREA WHERE COALESCE(IS_ACTIVE, 1) = 1 GROUP BY PROJECT_PROJECT_ID`),
            query(`SELECT PROJECT_PROJECT_ID AS PROJECT_ID, COUNT(*) AS CNT FROM ${t}.PROJECT_HAS_DEVELOPMENT_STAGE WHERE COALESCE(IS_ACTIVE, 1) = 1 GROUP BY PROJECT_PROJECT_ID`),
            query(`SELECT PROJECT_PROJECT_ID AS PROJECT_ID, COUNT(*) AS CNT FROM ${t}.PROJECT_HAS_CPUC_PROCEEDING WHERE COALESCE(IS_ACTIVE, 1) = 1 GROUP BY PROJECT_PROJECT_ID`),
            query(`SELECT p.PROJECT_ID, COUNT(*) AS CNT FROM ${t}.PROJECT_DETAIL_HAS_PARTNER j JOIN ${t}.PROJECT p ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = j.PROJECT_DETAIL_PROJECT_DETAIL_ID WHERE COALESCE(j.IS_ACTIVE, 1) = 1 GROUP BY p.PROJECT_ID`),
            query(`SELECT p.PROJECT_ID, COUNT(*) AS CNT FROM ${t}.FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER j JOIN ${t}.PROJECT p ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = j.FINANCE_DETAIL_FINANCE_DETAIL_ID WHERE COALESCE(j.IS_ACTIVE, 1) = 1 GROUP BY p.PROJECT_ID`),
            query(`SELECT p.PROJECT_ID, COUNT(*) AS CNT FROM ${t}.PROJECT_METRIC_HAS_CIC j JOIN ${t}.PROJECT p ON p.PROJECT_METRIC_PROJECT_METRIC_ID = j.PROJECT_METRIC_PROJECT_METRIC_ID WHERE COALESCE(j.IS_ACTIVE, 1) = 1 GROUP BY p.PROJECT_ID`),
            query(`SELECT p.PROJECT_ID, COUNT(*) AS CNT FROM ${t}.PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION j JOIN ${t}.PROJECT p ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = j.PROJECT_DETAIL_PROJECT_DETAIL_ID WHERE COALESCE(j.IS_ACTIVE, 1) = 1 GROUP BY p.PROJECT_ID`),
            query(`SELECT p.PROJECT_ID, COUNT(*) AS CNT FROM ${t}.PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA j JOIN ${t}.PROJECT p ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = j.PROJECT_DETAIL_PROJECT_DETAIL_ID WHERE COALESCE(j.IS_ACTIVE, 1) = 1 GROUP BY p.PROJECT_ID`),
        ]);

        const projectRows = toRows(projectQueryResult);

        const buildCountMap = (result: unknown): Map<number, number> => {
            const map = new Map<number, number>();
            for (const r of toRows(result)) {
                const id = num(pick(r, 'PROJECT_ID'));
                const cnt = num(pick(r, 'CNT'));
                if (id) map.set(id, cnt);
            }
            return map;
        };

        const invAreaMap = buildCountMap(invAreaCounts);
        const devStageMap = buildCountMap(devStageCounts);
        const cpucProcMap = buildCountMap(cpucProcCounts);
        const partnerMap = buildCountMap(partnerCounts);
        const matchPartnerMap = buildCountMap(matchPartnerCounts);
        const cicMap = buildCountMap(cicCounts);
        const buClassMap = buildCountMap(buClassCounts);
        const utilSvcMap = buildCountMap(utilSvcCounts);

        const projects: ComplianceProject[] = projectRows.map((r) => {
            const projectId = num(pick(r, 'PROJECT_ID'));

            const periodName = str(pick(r, 'PERIOD_NAME')).trim();
            const periodId = pick(r, 'PERIOD_ID');
            const epicPeriod =
                periodName || (hasNumber(periodId) ? `EPIC ${Number(periodId)}` : '');

            const adminName = str(pick(r, 'PROGRAM_ADMIN_NAME')).trim();
            const adminId = pick(r, 'PROGRAM_ADMIN_ID');
            const programAdmin =
                adminName || (hasNumber(adminId) ? (ADMIN_ID_TO_NAME[Number(adminId)] ?? '') : '');

            // ── Per-field fill status ──
            // Mirrors STAGE_KEY_TO_FORM in components/project_forms/stageRequirements.ts.
            const fs: Record<string, boolean> = {};

            // ── Entry stage ──
            fs.PROJECT_NAME = hasText(pick(r, 'PROJECT_NAME'));
            fs.PROJECT_NUMBER = hasText(pick(r, 'PROJECT_NUMBER'));
            fs.PROJECT_STATUS = hasText(pick(r, 'PROJECT_STATUS'));
            fs.PROJECT_LEAD = hasNumber(pick(r, 'PROJECT_LEAD_COMPANY_ID'));

            // PROJECT_LEAD_CONTACT — form maps to (contactFirstName + contactLastName + contactEmail), mode 'all'.
            // These come from PROJECT.PERSON_CONTACT_* columns.
            fs.PROJECT_LEAD_CONTACT =
                hasText(pick(r, 'PERSON_CONTACT_FIRST_NAME')) &&
                hasText(pick(r, 'PERSON_CONTACT_LAST_NAME')) &&
                hasText(pick(r, 'PERSON_CONTACT_EMAIL'));

            fs.EPIC_PERIOD = hasText(epicPeriod);
            fs.INVESTMENT_AREAS = (invAreaMap.get(projectId) ?? 0) > 0;
            fs.PROGRAM_ADMIN = hasText(programAdmin);
            fs.PROJECT_TYPE = hasNumber(pick(r, 'PROJECT_TYPE_ID'));

            // ADMIN_PROJECT_MANAGER — form maps to ANY of (contactFirstName, contactLastName,
            // contactEmail, cecMgrFirstName, cecMgrLastName, cecMgrEmail). The "either/or"
            // requirement: either the project contact OR the CEC manager has been recorded.
            fs.ADMIN_PROJECT_MANAGER =
                hasText(pick(r, 'PERSON_CONTACT_FIRST_NAME')) ||
                hasText(pick(r, 'PERSON_CONTACT_LAST_NAME')) ||
                hasText(pick(r, 'PERSON_CONTACT_EMAIL')) ||
                hasText(pick(r, 'CEC_MGR_CONTACT_FIRST_NAME')) ||
                hasText(pick(r, 'CEC_MGR_CONTACT_LAST_NAME')) ||
                hasText(pick(r, 'CEC_MGR_EMAIL'));

            fs.ASSEMBLY_DISTRICT =
                hasNumber(pick(r, 'ASSEMBLY_DISTRICT_AFTER_ID')) ||
                hasNumber(pick(r, 'ASSEMBLY_DISTRICT_BEFORE_ID'));
            fs.SENATE_DISTRICT =
                hasNumber(pick(r, 'SENATE_DISTRICT_AFTER_ID')) ||
                hasNumber(pick(r, 'SENATE_DISTRICT_BEFORE_ID'));
            fs.CLASSIFICATION_OF_BUSINESS = (buClassMap.get(projectId) ?? 0) > 0;
            fs.UTILITY_SERVICE_AREA = (utilSvcMap.get(projectId) ?? 0) > 0;

            // ── Active stage ──
            fs.PROJECT_AWARD_DATE = hasDate(pick(r, 'PROJECT_AWARD_DATE'));
            fs.PROJECT_START_DATE = hasDate(pick(r, 'PROJECT_START_DATE'));
            fs.PROJECT_END_DATE = hasDate(pick(r, 'PROJECT_END_DATE'));
            fs.SUMMARY_PROJECT_DESCRIPTION = hasText(pick(r, 'SUMMARY_PROJECT_DESCRIPTION'));
            fs.DETAILED_PROJECT_DESCRIPTION = hasText(pick(r, 'DETAILED_PROJECT_DESCRIPTION'));

            // PROJECT_GOALS — schema has a dedicated PROJECT_DETAIL.PROJECT_GOALS column;
            // form maps to projectSummary, but the DB has its own column. Prefer the
            // dedicated column, falling back to summary if empty (matches form's intent).
            fs.PROJECT_GOALS =
                hasText(pick(r, 'PROJECT_GOALS')) ||
                hasText(pick(r, 'SUMMARY_PROJECT_DESCRIPTION'));

            fs.DELIVERABLES = hasText(pick(r, 'DELIVERABLES'));
            fs.STATE_POLICY_SUPPORT_TEXT = hasText(pick(r, 'STATE_POLICY_SUPPORT_TEXT'));
            fs.TECHNICAL_BARRIERS = hasText(pick(r, 'TECHNICAL_BARRIERS'));
            fs.MARKET_BARRIERS = hasText(pick(r, 'MARKET_BARRIERS'));
            fs.KEY_INNOVATIONS = hasText(pick(r, 'KEY_INNOVATIONS'));
            fs.GETTING_TO_SCALE = hasText(pick(r, 'GETTING_TO_SCALE'));
            fs.PROJECTED_PROJECT_BENEFITS = hasText(pick(r, 'PROJECTED_PROJECT_BENEFITS'));

            fs.COMMITED_FUNDING_AMT = hasNumber(pick(r, 'COMMITED_FUNDING_AMT'));
            fs.FUNDS_EXPENDED_TO_DATE = hasNumber(pick(r, 'FUNDS_EXPENDED_TO_DATE'));

            // MATCH_FUNDING and TOTAL_MATCH_FUNDING both read MATCH_FUNDING_SPLIT.
            // Per components/project_forms/stageRequirements.ts (lines 150 + 155),
            // the form maps both stage keys to the `matchFundingSplit` form field,
            // and projectCreate/awardbands.ts writes that single value into the
            // FINANCE_DETAIL.MATCH_FUNDING_SPLIT column. The dedicated MATCH_FUNDING
            // column on the FINANCE_DETAIL table is never populated by the form,
            // so reading it here would always show "missing" even on complete projects.
            fs.MATCH_FUNDING = hasNumber(pick(r, 'MATCH_FUNDING_SPLIT'));

            fs.LEVERAGED_FUNDS = hasNumber(pick(r, 'LEVERAGED_FUNDS'));
            fs.CONTRACT_AMOUNT = hasNumber(pick(r, 'CONTRACT_AMOUNT'));
            fs.ENCUMBERED_FUNDING_AMT = hasNumber(pick(r, 'ENCUMBERED_FUNDING_AMT'));
            fs.ADMIN_OVERHEAD_COST = hasNumber(pick(r, 'ADMIN_AND_OVERHEAD_COST'));

            // TOTAL_MATCH_FUNDING — derived split in FINANCE_DETAIL.MATCH_FUNDING_SPLIT.
            fs.TOTAL_MATCH_FUNDING = hasNumber(pick(r, 'MATCH_FUNDING_SPLIT'));

            fs.MATCH_FUNDING_PARTNERS = (matchPartnerMap.get(projectId) ?? 0) > 0;

            // ── Boolean flag fields ──
            // These are 0/1 columns. The form treats booleans as always "set" (false is
            // a valid answer). For the dashboard we mirror that: a recorded 0 OR 1
            // counts as filled; only NULL/missing counts as unfilled.

            // CPUC_DACLI — schema has a dedicated CPUC_DACLI column AND component
            // CPUC_DAC / CPUC_LI columns. Filled if any of them has a recorded value.
            fs.CPUC_DACLI =
                hasFlagAnswer(pick(r, 'CPUC_DACLI')) ||
                hasFlagAnswer(pick(r, 'CPUC_DAC')) ||
                hasFlagAnswer(pick(r, 'CPUC_LI'));

            fs.COMMUNITY_BENEFITS = hasFlagAnswer(pick(r, 'COMMUNITY_BENEFITS'));
            fs.CYBER_SECURITY_CONSIDERATIONS = hasFlagAnswer(pick(r, 'CYBER_SECURITY_CONSIDERATIONS'));
            fs.ENERGY_EFFICIENCY_WORKPAPER = hasFlagAnswer(pick(r, 'IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED'));

            fs.DEVELOPMENT_STAGES = (devStageMap.get(projectId) ?? 0) > 0;
            fs.CPUC_PROCEEDINGS = (cpucProcMap.get(projectId) ?? 0) > 0;
            fs.PROJECT_PARTNERS = (partnerMap.get(projectId) ?? 0) > 0;

            fs.PROJECT_UPDATE = hasText(pick(r, 'PROJECT_UPDATE'));
            fs.ELEC_RELIABILITY_IMPACTS = hasText(pick(r, 'ELECTRICITY_SYSTEM_RELIABILITY_IMPACTS'));
            fs.ELEC_SAFETY_IMPACTS = hasText(pick(r, 'ELECTRICITY_SYSTEM_SAFETY_IMPACTS'));
            fs.POLICY_REGULATORY_BARRIERS = hasText(pick(r, 'POLICY_AND_REGULATORY_BARRIERS'));

            // ── Closeout stage ──
            fs.FINAL_REPORT_URL = hasText(pick(r, 'FINAL_REPORT_URL'));
            fs.KEY_LEARNINGS = hasText(pick(r, 'KEY_LEARNINGS'));
            fs.SCALABILITY = hasText(pick(r, 'SCALABILITY'));
            fs.STANDARDS = hasFlagAnswer(pick(r, 'STANDARDS'));            // 0/1 flag column
            fs.CONFIDENTIAL_INFO_CATEGORIES = (cicMap.get(projectId) ?? 0) > 0;
            fs.CYBERSECURITY_NARRATIVE = hasText(pick(r, 'CYBER_SECURITY_NARRATIVE'));
            fs.GHG_IMPACTS = hasText(pick(r, 'GHG_IMPACTS'));
            fs.ENVIRONMENTAL_IMPACT_NON_GHG = hasText(pick(r, 'ENVIRONMENTAL_IMPACTS_NON_GHG'));
            fs.RATEPAYER_BENEFITS = hasText(pick(r, 'RATEPAYERS_BENEFITS'));
            fs.COMMUNITY_BENEFITS_DESC = hasText(pick(r, 'COMMUNITY_BENEFITS_DESC'));
            fs.ENERGY_IMPACTS = hasText(pick(r, 'ENERGY_IMPACTS'));
            fs.INFRASTRUCTURE_COST_REDUCTIONS = hasText(
                pick(r, 'INFRASTRUCTURE_COST_REDUCTIONS_AND_ECONOMIC_BENEFITS'),
            );
            fs.OTHER_IMPACTS = hasText(pick(r, 'OTHER_IMPACTS'));
            fs.INFORMATION_DISSEMINATION = hasText(pick(r, 'INFORMATION_DISSEMINATION'));

            // ── Comprehensiveness (Appendix B rubric, 0-5 per narrative field) ──
            // Computed on-the-fly from the same raw narrative text already
            // selected above for the completeness (hasText) checks — no
            // extra query, no new columns. See comprehensivenessRubric.ts
            // for the scoring rules and their calibration caveats.
            const comprehensiveness = scoreProjectNarratives({
                DETAILED_PROJECT_DESCRIPTION: str(pick(r, 'DETAILED_PROJECT_DESCRIPTION')),
                DELIVERABLES: str(pick(r, 'DELIVERABLES')),
                PROJECT_GOALS: str(pick(r, 'PROJECT_GOALS')) || str(pick(r, 'SUMMARY_PROJECT_DESCRIPTION')),
                PROJECT_UPDATE: str(pick(r, 'PROJECT_UPDATE')),
                STATE_POLICY_SUPPORT_TEXT: str(pick(r, 'STATE_POLICY_SUPPORT_TEXT')),
                TECHNICAL_BARRIERS: str(pick(r, 'TECHNICAL_BARRIERS')),
                MARKET_BARRIERS: str(pick(r, 'MARKET_BARRIERS')),
                POLICY_REGULATORY_BARRIERS: str(pick(r, 'POLICY_AND_REGULATORY_BARRIERS')),
                GETTING_TO_SCALE: str(pick(r, 'GETTING_TO_SCALE')),
                KEY_INNOVATIONS: str(pick(r, 'KEY_INNOVATIONS')),
                KEY_LEARNINGS: str(pick(r, 'KEY_LEARNINGS')),
                SCALABILITY: str(pick(r, 'SCALABILITY')),
                PROJECTED_PROJECT_BENEFITS: str(pick(r, 'PROJECTED_PROJECT_BENEFITS')),
                ELEC_RELIABILITY_IMPACTS: str(pick(r, 'ELECTRICITY_SYSTEM_RELIABILITY_IMPACTS')),
                ELEC_SAFETY_IMPACTS: str(pick(r, 'ELECTRICITY_SYSTEM_SAFETY_IMPACTS')),
                ENVIRONMENTAL_IMPACT_NON_GHG: str(pick(r, 'ENVIRONMENTAL_IMPACTS_NON_GHG')),
                RATEPAYER_BENEFITS: str(pick(r, 'RATEPAYERS_BENEFITS')),
                COMMUNITY_BENEFITS_DESC: str(pick(r, 'COMMUNITY_BENEFITS_DESC')),
                ENERGY_IMPACTS: str(pick(r, 'ENERGY_IMPACTS')),
                INFRASTRUCTURE_COST_REDUCTIONS: str(pick(r, 'INFRASTRUCTURE_COST_REDUCTIONS_AND_ECONOMIC_BENEFITS')),
                OTHER_IMPACTS: str(pick(r, 'OTHER_IMPACTS')),
            });

            return {
                projectId,
                projectNumber: str(pick(r, 'PROJECT_NUMBER')).toUpperCase(),
                projectName: str(pick(r, 'PROJECT_NAME')),
                projectStatus: str(pick(r, 'PROJECT_STATUS')),
                epicPeriod,
                programAdmin,
                fieldStatus: fs,
                comprehensiveness,
                endDate: toIso(pick(r, 'PROJECT_END_DATE')),
                lastUpdate: toIso(pick(r, 'MODIFIED_DATE')),
            };
        });

        const body: ComplianceApiResponse = {
            projects,
            generatedAt: new Date().toISOString(),
        };

        const res = NextResponse.json(body);
        res.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120');
        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Compliance route error:', message);
        return NextResponse.json({ error: 'Failed to load compliance data' }, { status: 500 });
    }
}