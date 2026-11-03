// components/dashboard/compliance/auditRequirements.ts

import type { Cadence, FieldDef, StageDef } from './types';

interface AuditFieldSeed {
    key: string;
    label: string;
    table: string;
    description: string;
    cadence: Cadence;
}

function field(seed: AuditFieldSeed): FieldDef {
    return seed;
}

// ── Entry — rows 1–14 ────────────────────────────────────────────────
const ENTRY_FIELDS: FieldDef[] = [
    field({ key: 'PROJECT_NAME', label: 'Project Name', table: 'PROJECT', description: 'Official name of the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECT_NUMBER', label: 'Project Number', table: 'PROJECT', description: 'Agreement number (e.g. EPC-14-XXX).', cadence: 'once' }),
    field({ key: 'PROJECT_STATUS', label: 'Project Status', table: 'PROJECT', description: 'Current status of the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECT_LEAD', label: 'Project Lead', table: 'PROJECT → COMPANY', description: 'Lead company assigned to the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECT_LEAD_CONTACT', label: 'Project Lead Contact', table: 'PROJECT', description: 'Contact first name, last name and email — all three required.', cadence: 'if-needed' }),
    field({ key: 'EPIC_PERIOD', label: 'EPIC Period', table: 'PROJECT → INVESTMENT_PROGRAM_PERIOD', description: 'Investment program period (EPIC 1–4).', cadence: 'once' }),
    field({ key: 'INVESTMENT_AREAS', label: 'Investment Areas', table: 'PROJECT_HAS_INVESTMENT_AREA', description: 'At least one investment area assigned.', cadence: 'once' }),
    field({ key: 'PROGRAM_ADMIN', label: 'Program Admin', table: 'PROJECT → PROGRAM_ADMIN', description: 'Administering entity (CEC, SCE, PG&E, SDG&E).', cadence: 'once' }),
    field({ key: 'PROJECT_TYPE', label: 'Project Type', table: 'PROJECT', description: 'Type classification of the project.', cadence: 'if-needed' }),
    field({ key: 'ADMIN_PROJECT_MANAGER', label: 'Admin Project Manager', table: 'PROJECT', description: 'Project contact or CEC/IOU manager — any one filled.', cadence: 'if-needed' }),
    field({ key: 'ASSEMBLY_DISTRICT', label: 'Assembly District', table: 'PROJECT', description: 'California Assembly district (before or after redistricting).', cadence: 'if-needed' }),
    field({ key: 'SENATE_DISTRICT', label: 'Senate District', table: 'PROJECT', description: 'California Senate district (before or after redistricting).', cadence: 'if-needed' }),
    field({ key: 'CLASSIFICATION_OF_BUSINESS', label: 'Classification of Business', table: 'PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION', description: 'At least one business classification.', cadence: 'if-needed' }),
    field({ key: 'UTILITY_SERVICE_AREA', label: 'Utility Service Area', table: 'PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA', description: 'At least one utility service territory.', cadence: 'if-needed' }),
];

// ── Active — required from the moment a project is listed ────────────
const ACTIVE_FIELDS: FieldDef[] = [
    field({ key: 'PROJECT_AWARD_DATE', label: 'Project Award Date', table: 'PROJECT', description: 'Date the project was awarded.', cadence: 'once' }),
    field({ key: 'PROJECT_START_DATE', label: 'Project Start Date', table: 'PROJECT', description: 'Formal start date of the project.', cadence: 'once' }),
    field({ key: 'SUMMARY_PROJECT_DESCRIPTION', label: 'Summary Project Description', table: 'PROJECT_DETAIL', description: 'Summary narrative including goals and innovation.', cadence: 'if-needed' }),
    field({ key: 'DETAILED_PROJECT_DESCRIPTION', label: 'Detailed Project Description', table: 'PROJECT_DETAIL', description: 'Full narrative of goals, challenges, and barriers.', cadence: 'if-needed' }),
    field({ key: 'DELIVERABLES', label: 'Deliverables', table: 'PROJECT_DETAIL', description: 'Description of milestones and deliverables.', cadence: 'if-needed' }),
    field({ key: 'STATE_POLICY_SUPPORT_TEXT', label: 'State Policy Support', table: 'PROJECT_DETAIL', description: 'How the project supports state statutory energy goals.', cadence: 'if-needed' }),
    field({ key: 'TECHNICAL_BARRIERS', label: 'Technical Barriers', table: 'PROJECT_DETAIL', description: 'Narrative on overcoming technical challenges.', cadence: 'if-needed' }),
    field({ key: 'MARKET_BARRIERS', label: 'Market Barriers', table: 'PROJECT_DETAIL', description: 'Narrative on overcoming market challenges.', cadence: 'if-needed' }),
    field({ key: 'KEY_INNOVATIONS', label: 'Key Innovations', table: 'PROJECT_DETAIL', description: 'Innovations compared to state of the art.', cadence: 'if-needed' }),
    field({ key: 'GETTING_TO_SCALE', label: 'Getting to Scale', table: 'PROJECT_DETAIL', description: 'What is needed to scale or implement.', cadence: 'if-needed' }),
    field({ key: 'PROJECTED_PROJECT_BENEFITS', label: 'Projected Project Benefits', table: 'PROJECT_METRIC', description: 'Projected benefits of the project.', cadence: 'if-needed' }),
    field({ key: 'COMMITED_FUNDING_AMT', label: 'Committed Funding', table: 'FINANCE_DETAIL', description: 'Committed funding amount for the project.', cadence: 'quarterly' }),
    field({ key: 'FUNDS_EXPENDED_TO_DATE', label: 'Funds Expended to Date', table: 'FINANCE_DETAIL', description: 'Total funds expended through current quarter.', cadence: 'quarterly' }),
    field({ key: 'LEVERAGED_FUNDS', label: 'Leveraged Funds', table: 'FINANCE_DETAIL', description: 'Leveraged funding from other sources.', cadence: 'quarterly' }),
    field({ key: 'MATCH_FUNDING', label: 'Match Funding', table: 'FINANCE_DETAIL', description: 'Match funding recorded for the project.', cadence: 'quarterly' }),
];

// ── After 1st Annual — due June 1 of the year after the start year ───
const FIRST_ANNUAL_FIELDS: FieldDef[] = [
    field({ key: 'PROJECT_END_DATE', label: 'Project End Date', table: 'PROJECT', description: 'Formal end date of the project.', cadence: 'once' }),
    field({ key: 'PROJECT_GOALS', label: 'Project Goals', table: 'PROJECT_DETAIL', description: 'Narrative of the project goals.', cadence: 'if-needed' }),
    field({ key: 'POLICY_REGULATORY_BARRIERS', label: 'Policy & Regulatory Barriers', table: 'PROJECT_DETAIL', description: 'Policy and regulatory barriers encountered.', cadence: 'annual' }),
    field({ key: 'PROJECT_UPDATE', label: 'Project Update', table: 'PROJECT_DETAIL', description: 'Running narrative of project progress.', cadence: 'annual' }),
    field({ key: 'ENCUMBERED_FUNDING_AMT', label: 'Encumbered Funding', table: 'FINANCE_DETAIL', description: 'Project encumbered funding amount.', cadence: 'annual' }),
    field({ key: 'CONTRACT_AMOUNT', label: 'Contract Amount', table: 'FINANCE_DETAIL', description: 'Total contract amount.', cadence: 'once' }),
    field({ key: 'ADMIN_OVERHEAD_COST', label: 'Admin & Overhead Cost', table: 'FINANCE_DETAIL', description: 'Project administrative and overhead costs.', cadence: 'annual' }),
    field({ key: 'TOTAL_MATCH_FUNDING', label: 'Total Match Funding', table: 'FINANCE_DETAIL', description: 'Total match funding across all partners.', cadence: 'annual' }),
    field({ key: 'MATCH_FUNDING_PARTNERS', label: 'Match Funding Partners', table: 'FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER', description: 'List of match funding partner organizations.', cadence: 'annual' }),
    field({ key: 'PROJECT_PARTNERS', label: 'Project Partners', table: 'PROJECT_DETAIL_HAS_PARTNER', description: 'Partner organizations on the project.', cadence: 'annual' }),
    field({ key: 'DEVELOPMENT_STAGES', label: 'Development Stages', table: 'PROJECT_HAS_DEVELOPMENT_STAGE', description: 'At least one development stage or TRL assigned.', cadence: 'annual' }),
    field({ key: 'CPUC_PROCEEDINGS', label: 'CPUC Proceedings', table: 'PROJECT_HAS_CPUC_PROCEEDING', description: 'Linked CPUC proceeding number(s).', cadence: 'annual' }),
    field({ key: 'CPUC_DACLI', label: 'CPUC DAC / LI', table: 'PROJECT', description: 'Disadvantaged / low-income community flag recorded (yes or no).', cadence: 'annual' }),
    field({ key: 'COMMUNITY_BENEFITS', label: 'Community Benefits (Yes/No)', table: 'PROJECT', description: 'Community benefits flag recorded (yes or no).', cadence: 'annual' }),
    field({ key: 'CYBER_SECURITY_CONSIDERATIONS', label: 'Cybersecurity Considerations', table: 'PROJECT', description: 'Cybersecurity considerations flag recorded (yes or no).', cadence: 'annual' }),
    field({ key: 'ENERGY_EFFICIENCY_WORKPAPER', label: 'Energy Efficiency Workpaper', table: 'PROJECT', description: 'EE workpaper produced flag recorded (yes or no).', cadence: 'annual' }),
    field({ key: 'ELEC_RELIABILITY_IMPACTS', label: 'Electric Reliability Impacts', table: 'PROJECT_METRIC', description: 'Impact on electricity system reliability.', cadence: 'annual' }),
    field({ key: 'ELEC_SAFETY_IMPACTS', label: 'Electric Safety Impacts', table: 'PROJECT_METRIC', description: 'Impact on electricity system safety.', cadence: 'annual' }),
];

// ── Closeout — required once Completed ───────────────────────────────
const CLOSEOUT_FIELDS: FieldDef[] = [
    field({ key: 'FINAL_REPORT_URL', label: 'Final Report URL', table: 'PROJECT_DETAIL', description: 'PDF of the final report.', cadence: 'once' }),
    field({ key: 'KEY_LEARNINGS', label: 'Key Learnings', table: 'PROJECT_DETAIL', description: 'Key learnings and realized innovations.', cadence: 'once' }),
    field({ key: 'SCALABILITY', label: 'Scalability', table: 'PROJECT_DETAIL', description: 'How the innovation can be duplicated or adapted.', cadence: 'once' }),
    field({ key: 'STANDARDS', label: 'Standards', table: 'PROJECT', description: 'Standards flag recorded (yes or no).', cadence: 'once' }),
    field({ key: 'CONFIDENTIAL_INFO_CATEGORIES', label: 'Confidential Info Categories', table: 'PROJECT_METRIC_HAS_CIC', description: 'Categories of confidential information in the project.', cadence: 'once' }),
    field({ key: 'CYBERSECURITY_NARRATIVE', label: 'Cybersecurity Narrative', table: 'PROJECT_DETAIL', description: 'Narrative description of cybersecurity considerations.', cadence: 'once' }),
    field({ key: 'GHG_IMPACTS', label: 'GHG Impacts', table: 'PROJECT_METRIC', description: 'Greenhouse gas emission impacts of the project.', cadence: 'once' }),
    field({ key: 'ENVIRONMENTAL_IMPACT_NON_GHG', label: 'Environmental Impacts (Non-GHG)', table: 'PROJECT_METRIC', description: 'Non-GHG environmental impacts.', cadence: 'once' }),
    field({ key: 'RATEPAYER_BENEFITS', label: 'Ratepayer Benefits', table: 'PROJECT_METRIC', description: 'Benefits to California ratepayers.', cadence: 'once' }),
    field({ key: 'COMMUNITY_BENEFITS_DESC', label: 'Community Benefits Description', table: 'PROJECT_METRIC', description: 'Narrative description of community benefits.', cadence: 'once' }),
    field({ key: 'ENERGY_IMPACTS', label: 'Energy Impacts', table: 'PROJECT_METRIC', description: 'Energy system impacts of the project.', cadence: 'once' }),
    field({ key: 'INFRASTRUCTURE_COST_REDUCTIONS', label: 'Infrastructure Cost Reductions', table: 'PROJECT_METRIC', description: 'Infrastructure cost reductions and other economic benefits.', cadence: 'once' }),
    field({ key: 'OTHER_IMPACTS', label: 'Other Impacts', table: 'PROJECT_METRIC', description: 'Other notable project impacts.', cadence: 'once' }),
    field({ key: 'INFORMATION_DISSEMINATION', label: 'Information Dissemination', table: 'PROJECT_METRIC', description: 'How findings and results are disseminated.', cadence: 'once' }),
];

export const AUDIT_REQUIREMENTS: StageDef[] = [
    {
        stage: 'Entry',
        description: 'Required as soon as the project is listed in the database, regardless of status.',
        fields: ENTRY_FIELDS,
    },
    {
        stage: 'Active',
        description: 'Required as soon as the project is listed in the database, regardless of status.',
        fields: ACTIVE_FIELDS,
    },
    {
        stage: 'After 1st Annual',
        description:
            'Due with the first annual report filing — June 1 of the calendar year after the project start year — and at every check thereafter. Required immediately once a project is Completed.',
        fields: FIRST_ANNUAL_FIELDS,
    },
    {
        stage: 'Closeout',
        description: 'Required once a project is Completed.',
        fields: CLOSEOUT_FIELDS,
    },
];

/**
 * First-annual-report trigger: month (1–12) and day. The first annual report
 * is filed after Q1, usually April–May, so June 1 is the point at which the
 * After-1st-Annual tier becomes enforceable. June 1 was proposed by the
 * stakeholder, not formally adopted — change it here if that shifts.
 */
export const FIRST_ANNUAL_DUE_MONTH = 6;
export const FIRST_ANNUAL_DUE_DAY = 1;