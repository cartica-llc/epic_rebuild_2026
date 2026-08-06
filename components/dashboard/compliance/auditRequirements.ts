import type { Cadence, FieldDef, StageDef, StageName } from './types';

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

const INITIAL_FIELDS: FieldDef[] = [
    field({ key: 'PROJECT_NAME', label: 'Project Name', table: 'PROJECT', description: 'Official name of the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECT_NUMBER', label: 'Project Number', table: 'PROJECT', description: 'Agreement number (e.g. EPC-14-XXX).', cadence: 'once' }),
    field({ key: 'PROJECT_STATUS', label: 'Project Status', table: 'PROJECT', description: 'Current status of the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECT_START_DATE', label: 'Project Start Date', table: 'PROJECT', description: 'Formal start date of the project.', cadence: 'once' }),
    field({ key: 'PROJECT_END_DATE', label: 'Project End Date', table: 'PROJECT', description: 'Formal end date of the project.', cadence: 'once' }),
    field({ key: 'PROJECT_AWARD_DATE', label: 'Project Award Date', table: 'PROJECT', description: 'Date the project was awarded.', cadence: 'once' }),
    field({ key: 'PROJECT_LEAD', label: 'Project Lead', table: 'PROJECT → COMPANY', description: 'Lead company assigned to the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECT_LEAD_CONTACT', label: 'Contact Person (first/last name, email)', table: 'PROJECT', description: 'Contact information for the project lead. Bundles the doc’s "Contact person first name/last name/email" into one check.', cadence: 'if-needed' }),
    field({ key: 'ASSEMBLY_DISTRICT', label: 'Assembly District', table: 'PROJECT', description: 'California Assembly district for the project.', cadence: 'if-needed' }),
    field({ key: 'SENATE_DISTRICT', label: 'Senate District', table: 'PROJECT', description: 'California Senate district for the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECT_TYPE', label: 'Project Type', table: 'PROJECT', description: 'Type classification of the project.', cadence: 'if-needed' }),
    field({ key: 'EPIC_PERIOD', label: 'Investment Program Period', table: 'PROJECT → INVESTMENT_PROGRAM_PERIOD', description: 'Investment program period (EPIC 1–4).', cadence: 'once' }),
    field({ key: 'INVESTMENT_AREAS', label: 'Investment Area', table: 'PROJECT_HAS_INVESTMENT_AREA', description: 'At least one investment area assigned.', cadence: 'once' }),
    field({ key: 'CPUC_PROCEEDINGS', label: 'CPUC Proceedings', table: 'PROJECT_HAS_CPUC_PROCEEDING', description: 'Linked CPUC proceeding number(s).', cadence: 'annual' }),
    field({ key: 'PROGRAM_ADMIN', label: 'Program Admin', table: 'PROJECT → PROGRAM_ADMIN', description: 'Administering entity (CEC, SCE, PG&E, SDG&E).', cadence: 'once' }),
    field({ key: 'DETAILED_PROJECT_DESCRIPTION', label: 'Detailed Project Description', table: 'PROJECT_DETAIL', description: 'Full narrative of goals, challenges, and barriers.', cadence: 'if-needed' }),
    field({ key: 'SUMMARY_PROJECT_DESCRIPTION', label: 'Project Summary', table: 'PROJECT_DETAIL', description: 'Summary narrative including goals and innovation.', cadence: 'if-needed' }),
    field({ key: 'DELIVERABLES', label: 'Project Deliverables', table: 'PROJECT_DETAIL', description: 'Description of milestones and deliverables.', cadence: 'if-needed' }),
    field({ key: 'STATE_POLICY_SUPPORT_TEXT', label: 'How It Supports State Policy', table: 'PROJECT_DETAIL', description: 'How project supports state statutory energy goals.', cadence: 'if-needed' }),
    field({ key: 'TECHNICAL_BARRIERS', label: 'Technical Barriers', table: 'PROJECT_DETAIL', description: 'Narrative on overcoming technical challenges.', cadence: 'if-needed' }),
    field({ key: 'MARKET_BARRIERS', label: 'Market Barriers', table: 'PROJECT_DETAIL', description: 'Narrative on overcoming market challenges.', cadence: 'if-needed' }),
    field({ key: 'GETTING_TO_SCALE', label: 'Getting to Scale', table: 'PROJECT_DETAIL', description: 'What is needed to scale or implement.', cadence: 'if-needed' }),
    field({ key: 'KEY_INNOVATIONS', label: 'Key Innovations', table: 'PROJECT_DETAIL', description: 'Innovations compared to state of the art.', cadence: 'if-needed' }),
    field({ key: 'UTILITY_SERVICE_AREA', label: 'Utility Service Areas', table: 'PROJECT', description: 'Utility service territory for the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECTED_PROJECT_BENEFITS', label: 'Projected Project Benefits', table: 'PROJECT_DETAIL', description: 'Projected benefits of the project.', cadence: 'if-needed' }),
    field({ key: 'PROJECT_GOALS', label: 'Project Goals', table: 'PROJECT_DETAIL', description: 'Narrative of the project goals.', cadence: 'if-needed' }),
];

const ANNUAL_FIELDS: FieldDef[] = [
    field({ key: 'DEVELOPMENT_STAGES', label: 'Development Stage', table: 'PROJECT_HAS_DEVELOPMENT_STAGE', description: 'At least one development stage or TRL assigned.', cadence: 'annual' }),
    field({ key: 'PROJECT_PARTNERS', label: 'Project Partners', table: 'PROJECT_HAS_PARTNER', description: 'Partner organizations on the project.', cadence: 'annual' }),
    field({ key: 'PROJECT_UPDATE', label: 'Project Update', table: 'PROJECT_DETAIL', description: 'Running narrative of project progress.', cadence: 'annual' }),
    field({ key: 'MATCH_FUNDING_PARTNERS', label: 'Match Funding Partners', table: 'FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER', description: 'List of match funding partner organizations.', cadence: 'annual' }),
    field({ key: 'ENCUMBERED_FUNDING_AMT', label: 'Project Encumbered Funding Amount', table: 'FINANCE_DETAIL', description: 'Project encumbered funding amount.', cadence: 'annual' }),
    field({ key: 'ADMIN_OVERHEAD_COST', label: 'Project Administrative and Overhead Cost', table: 'FINANCE_DETAIL', description: 'Project administrative and overhead costs.', cadence: 'annual' }),
    field({ key: 'TOTAL_MATCH_FUNDING', label: 'Total Project Match Funding', table: 'FINANCE_DETAIL', description: 'Total match funding across all partners.', cadence: 'annual' }),
    field({ key: 'ELEC_RELIABILITY_IMPACTS', label: 'Electricity System Reliability Impacts', table: 'PROJECT_DETAIL', description: 'Impact on electricity system reliability.', cadence: 'annual' }),
    field({ key: 'ELEC_SAFETY_IMPACTS', label: 'Electricity System Safety Impacts', table: 'PROJECT_DETAIL', description: 'Impact on electricity system safety.', cadence: 'annual' }),
    field({ key: 'POLICY_REGULATORY_BARRIERS', label: 'Policy and Regulatory Barriers', table: 'PROJECT_DETAIL', description: 'Policy and regulatory barriers encountered.', cadence: 'annual' }),
    field({ key: 'COMMITED_FUNDING_AMT', label: 'Project Committed Funding Amount', table: 'FINANCE_DETAIL', description: 'Committed funding amount for the project.', cadence: 'quarterly' }),
    field({ key: 'FUNDS_EXPENDED_TO_DATE', label: 'Project Funds Expended to Date', table: 'FINANCE_DETAIL', description: 'Total funds expended through current quarter.', cadence: 'quarterly' }),
    field({ key: 'LEVERAGED_FUNDS', label: 'Leveraged Funds', table: 'FINANCE_DETAIL', description: 'Leveraged funding from other sources.', cadence: 'quarterly' }),
    field({ key: 'CONTRACT_AMOUNT', label: 'Contract Amount', table: 'FINANCE_DETAIL', description: 'Total contract amount.', cadence: 'once' }),
];

const END_FIELDS: FieldDef[] = [
    field({ key: 'FINAL_REPORT_URL', label: 'Final Report', table: 'PROJECT_DETAIL', description: 'PDF of the final report.', cadence: 'once' }),
    field({ key: 'KEY_LEARNINGS', label: 'Key Learnings', table: 'PROJECT_DETAIL', description: 'Key learnings and realized innovations.', cadence: 'once' }),
    field({ key: 'SCALABILITY', label: 'Scalability', table: 'PROJECT_DETAIL', description: 'How the innovation can be duplicated or adapted.', cadence: 'once' }),
    field({ key: 'CONFIDENTIAL_INFO_CATEGORIES', label: 'Confidential Information Categories', table: 'PROJECT_METRIC_HAS_CIC', description: 'Categories of confidential information in the project.', cadence: 'once' }),
    field({ key: 'CYBERSECURITY_NARRATIVE', label: 'Cyber Security Narrative', table: 'PROJECT_DETAIL', description: 'Narrative description of cybersecurity considerations.', cadence: 'once' }),
    field({ key: 'GHG_IMPACTS', label: 'GHG Impacts', table: 'PROJECT_METRIC', description: 'Greenhouse gas emission impacts of the project.', cadence: 'once' }),
    field({ key: 'ENVIRONMENTAL_IMPACT_NON_GHG', label: 'Environmental Impacts, Non-GHG', table: 'PROJECT_METRIC', description: 'Non-GHG environmental impacts.', cadence: 'once' }),
    field({ key: 'RATEPAYER_BENEFITS', label: 'Ratepayer Benefits', table: 'PROJECT_METRIC', description: 'Benefits to California ratepayers.', cadence: 'once' }),
    field({ key: 'COMMUNITY_BENEFITS_DESC', label: 'Community Benefits Description', table: 'PROJECT_METRIC', description: 'Narrative description of community benefits.', cadence: 'once' }),
    field({ key: 'ENERGY_IMPACTS', label: 'Energy Impacts', table: 'PROJECT_METRIC', description: 'Energy system impacts of the project.', cadence: 'once' }),
    field({ key: 'INFRASTRUCTURE_COST_REDUCTIONS', label: 'Infrastructure Cost Benefits', table: 'PROJECT_METRIC', description: 'Infrastructure cost reductions and other economic benefits.', cadence: 'once' }),
    field({ key: 'OTHER_IMPACTS', label: 'Other Impacts', table: 'PROJECT_METRIC', description: 'Other notable project impacts.', cadence: 'once' }),
    field({ key: 'INFORMATION_DISSEMINATION', label: 'Information Dissemination', table: 'PROJECT_METRIC', description: 'How findings and results are disseminated.', cadence: 'once' }),
];

export const AUDIT_REQUIREMENTS: StageDef[] = [
    {
        stage: 'Initial' as StageName,
        description: 'Due as soon as practical after project start, no later than the next quarterly update — required regardless of project status.',
        fields: INITIAL_FIELDS,
    },
    {
        stage: 'Annual' as StageName,
        description: 'Due by the first annual report filing once a project has been running roughly a year, or immediately once a project is Completed.',
        fields: ANNUAL_FIELDS,
    },
    {
        stage: 'End' as StageName,
        description: 'Due as soon as practical after project end, no later than the next annual report — required once a project is Completed.',
        fields: END_FIELDS,
    },
];

export const ANNUAL_GATE_DAYS = 365;