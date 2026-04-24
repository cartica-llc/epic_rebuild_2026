// ─── components/project_forms/stageRequirements.ts ───────────────────
// Stage definitions, field mapping, and completion logic.

import type { ProjectFormData } from './types';

// ─── Stage field definition ──────────────────────────────────────────

export interface StageField {
    key: string;
    label: string;
    table: string;
    description: string;
    cadence: 'once' | 'annual' | 'quarterly' | 'if-needed';
}

export interface Stage {
    stage: string;
    description: string;
    fields: StageField[];
}

// ─── Stage requirements ──────────────────────────────────────────────

export const STAGE_REQUIREMENTS: Stage[] = [
    {
        stage: 'Entry',
        description: 'Required at project creation',
        fields: [
            { key: 'PROJECT_NAME', label: 'Project Name', table: 'PROJECT', description: 'Official name of the project.', cadence: 'if-needed' },
            { key: 'PROJECT_NUMBER', label: 'Project Number', table: 'PROJECT', description: 'Agreement number (e.g. EPC-14-XXX).', cadence: 'once' },
            { key: 'PROJECT_STATUS', label: 'Project Status', table: 'PROJECT', description: 'Current status of the project.', cadence: 'if-needed' },
            { key: 'PROJECT_LEAD', label: 'Project Lead', table: 'PROJECT → COMPANY', description: 'Lead company assigned to the project.', cadence: 'if-needed' },
            { key: 'PROJECT_LEAD_CONTACT', label: 'Project Lead Contact Info', table: 'COMPANY', description: 'Contact information for the project lead.', cadence: 'if-needed' },
            { key: 'EPIC_PERIOD', label: 'EPIC Period', table: 'PROJECT → INVESTMENT_PROGRAM_PERIOD', description: 'Investment program period (EPIC 1–4).', cadence: 'once' },
            { key: 'INVESTMENT_AREAS', label: 'Investment Area(s)', table: 'PROJECT_HAS_INVESTMENT_AREA', description: 'At least one investment area assigned.', cadence: 'once' },
            { key: 'PROGRAM_ADMIN', label: 'Program Administrator', table: 'PROJECT → PROGRAM_ADMIN', description: 'Administering entity (CEC, SCE, PG&E, SDG&E).', cadence: 'once' },
            { key: 'PROJECT_TYPE', label: 'Project Type', table: 'PROJECT', description: 'Type classification of the project.', cadence: 'if-needed' },
            { key: 'ADMIN_PROJECT_MANAGER', label: 'Administrator Project Manager', table: 'PROJECT', description: 'CEC or IOU project manager assigned.', cadence: 'if-needed' },
            { key: 'ASSEMBLY_DISTRICT', label: 'Assembly District', table: 'PROJECT', description: 'California Assembly district for the project.', cadence: 'if-needed' },
            { key: 'SENATE_DISTRICT', label: 'Senate District', table: 'PROJECT', description: 'California Senate district for the project.', cadence: 'if-needed' },
            { key: 'CLASSIFICATION_OF_BUSINESS', label: 'Classification of the Business', table: 'PROJECT → COMPANY', description: 'Business classification of the lead entity.', cadence: 'if-needed' },
            { key: 'UTILITY_SERVICE_AREA', label: 'Utility Service Area', table: 'PROJECT', description: 'Utility service territory for the project.', cadence: 'if-needed' },
        ],
    },
    {
        stage: 'Active',
        description: 'Required once project is in progress',
        fields: [
            { key: 'PROJECT_AWARD_DATE', label: 'Award Date', table: 'PROJECT', description: 'Date the project was awarded.', cadence: 'once' },
            { key: 'PROJECT_START_DATE', label: 'Start Date', table: 'PROJECT', description: 'Formal start date of the project.', cadence: 'once' },
            { key: 'PROJECT_END_DATE', label: 'End Date', table: 'PROJECT', description: 'Formal end date of the project.', cadence: 'annual' },
            { key: 'SUMMARY_PROJECT_DESCRIPTION', label: 'Summary Description', table: 'PROJECT_DETAIL', description: 'Summary narrative including goals and innovation.', cadence: 'if-needed' },
            { key: 'DETAILED_PROJECT_DESCRIPTION', label: 'Detailed Description', table: 'PROJECT_DETAIL', description: 'Full narrative of goals, challenges, and barriers.', cadence: 'if-needed' },
            { key: 'PROJECT_GOALS', label: 'Project Goals', table: 'PROJECT_DETAIL', description: 'Narrative of the project goals.', cadence: 'if-needed' },
            { key: 'DELIVERABLES', label: 'Project Deliverables', table: 'PROJECT_DETAIL', description: 'Description of milestones and deliverables.', cadence: 'if-needed' },
            { key: 'STATE_POLICY_SUPPORT_TEXT', label: 'State Policy Support', table: 'PROJECT_DETAIL', description: 'How project supports state statutory energy goals.', cadence: 'if-needed' },
            { key: 'TECHNICAL_BARRIERS', label: 'Technical Barriers', table: 'PROJECT_DETAIL', description: 'Narrative on overcoming technical challenges.', cadence: 'if-needed' },
            { key: 'MARKET_BARRIERS', label: 'Market Barriers', table: 'PROJECT_DETAIL', description: 'Narrative on overcoming market challenges.', cadence: 'if-needed' },
            { key: 'KEY_INNOVATIONS', label: 'Key Innovations', table: 'PROJECT_DETAIL', description: 'Innovations compared to state of the art.', cadence: 'if-needed' },
            { key: 'GETTING_TO_SCALE', label: 'Getting to Scale', table: 'PROJECT_DETAIL', description: 'What is needed to scale or implement.', cadence: 'if-needed' },
            { key: 'PROJECTED_PROJECT_BENEFITS', label: 'Projected Project Benefits', table: 'PROJECT_DETAIL', description: 'Projected benefits of the project.', cadence: 'if-needed' },
            { key: 'COMMITED_FUNDING_AMT', label: 'Committed Funding', table: 'FINANCE_DETAIL', description: 'Committed funding amount for the project.', cadence: 'quarterly' },
            { key: 'FUNDS_EXPENDED_TO_DATE', label: 'Funds Expended to Date', table: 'FINANCE_DETAIL', description: 'Total funds expended through current quarter.', cadence: 'quarterly' },
            { key: 'MATCH_FUNDING', label: 'Match Funding', table: 'FINANCE_DETAIL', description: 'Match funding amount for the current period.', cadence: 'quarterly' },
            { key: 'LEVERAGED_FUNDS', label: 'Leveraged Funds', table: 'FINANCE_DETAIL', description: 'Leveraged funding from other sources.', cadence: 'quarterly' },
            { key: 'CONTRACT_AMOUNT', label: 'Contract Amount', table: 'FINANCE_DETAIL', description: 'Total contract amount.', cadence: 'once' },
            { key: 'ENCUMBERED_FUNDING_AMT', label: 'Encumbered Funding Amount', table: 'FINANCE_DETAIL', description: 'Project encumbered funding amount.', cadence: 'annual' },
            { key: 'ADMIN_OVERHEAD_COST', label: 'Admin and Overhead Cost', table: 'FINANCE_DETAIL', description: 'Project administrative and overhead costs.', cadence: 'annual' },
            { key: 'TOTAL_MATCH_FUNDING', label: 'Total Project Match Funding', table: 'FINANCE_DETAIL', description: 'Total match funding across all partners.', cadence: 'annual' },
            { key: 'MATCH_FUNDING_PARTNERS', label: 'Match Funding Partners', table: 'FINANCE_DETAIL', description: 'List of match funding partner organizations.', cadence: 'annual' },
            { key: 'CPUC_DACLI', label: 'DAC/LI Flag', table: 'PROJECT', description: 'CPUC DAC / Low-Income designation (0 or 1).', cadence: 'once' },
            { key: 'COMMUNITY_BENEFITS', label: 'Community Benefits (flag)', table: 'PROJECT', description: 'Community benefits flag.', cadence: 'annual' },
            { key: 'CYBER_SECURITY_CONSIDERATIONS', label: 'Cybersecurity Considerations (flag)', table: 'PROJECT', description: 'Cybersecurity considerations flag.', cadence: 'annual' },
            { key: 'ENERGY_EFFICIENCY_WORKPAPER', label: 'Energy Efficiency Workpaper Data (flag)', table: 'PROJECT', description: 'Energy efficiency workpaper data flag.', cadence: 'annual' },
            { key: 'DEVELOPMENT_STAGES', label: 'Development Stage(s)', table: 'PROJECT_HAS_DEVELOPMENT_STAGE', description: 'At least one development stage or TRL assigned.', cadence: 'annual' },
            { key: 'CPUC_PROCEEDINGS', label: 'CPUC Proceeding(s)', table: 'PROJECT_HAS_CPUC_PROCEEDING', description: 'Linked CPUC proceeding number(s).', cadence: 'annual' },
            { key: 'PROJECT_PARTNERS', label: 'Project Partners', table: 'PROJECT_HAS_PARTNER', description: 'Partner organizations on the project.', cadence: 'annual' },
            { key: 'PROJECT_UPDATE', label: 'Project Update', table: 'PROJECT_DETAIL', description: 'Running narrative of project progress.', cadence: 'annual' },
            { key: 'ELEC_RELIABILITY_IMPACTS', label: 'Electricity System Reliability Impacts', table: 'PROJECT_DETAIL', description: 'Impact on electricity system reliability.', cadence: 'annual' },
            { key: 'ELEC_SAFETY_IMPACTS', label: 'Electricity System Safety Impacts', table: 'PROJECT_DETAIL', description: 'Impact on electricity system safety.', cadence: 'annual' },
            { key: 'POLICY_REGULATORY_BARRIERS', label: 'Policy and Regulatory Barriers', table: 'PROJECT_DETAIL', description: 'Policy and regulatory barriers encountered.', cadence: 'annual' },
        ],
    },
    {
        stage: 'Closeout',
        description: 'Required at project completion (with final report)',
        fields: [
            { key: 'FINAL_REPORT_URL', label: 'Final Report', table: 'PROJECT_DETAIL', description: 'PDF of the final report.', cadence: 'once' },
            { key: 'KEY_LEARNINGS', label: 'Key Learnings', table: 'PROJECT_DETAIL', description: 'Key learnings and realized innovations.', cadence: 'once' },
            { key: 'SCALABILITY', label: 'Scalability', table: 'PROJECT_DETAIL', description: 'How the innovation can be duplicated or adapted.', cadence: 'once' },
            { key: 'STANDARDS', label: 'Standards', table: 'PROJECT_DETAIL', description: 'Applicable standards or standards contributions.', cadence: 'once' },
            { key: 'CONFIDENTIAL_INFO_CATEGORIES', label: 'Confidential Information Categories', table: 'PROJECT_DETAIL', description: 'Categories of confidential information in the project.', cadence: 'once' },
            { key: 'CYBERSECURITY_NARRATIVE', label: 'Cybersecurity Narrative', table: 'PROJECT_DETAIL', description: 'Narrative description of cybersecurity considerations.', cadence: 'once' },
            { key: 'GHG_IMPACTS', label: 'GHG Impacts', table: 'PROJECT_DETAIL', description: 'Greenhouse gas emission impacts of the project.', cadence: 'once' },
            { key: 'ENVIRONMENTAL_IMPACT_NON_GHG', label: 'Environmental Impact – non-GHG', table: 'PROJECT_DETAIL', description: 'Non-GHG environmental impacts.', cadence: 'once' },
            { key: 'RATEPAYER_BENEFITS', label: 'Ratepayer Benefits', table: 'PROJECT_DETAIL', description: 'Benefits to California ratepayers.', cadence: 'once' },
            { key: 'COMMUNITY_BENEFITS_DESC', label: 'Community Benefits Description', table: 'PROJECT_DETAIL', description: 'Narrative description of community benefits.', cadence: 'once' },
            { key: 'ENERGY_IMPACTS', label: 'Energy Impacts', table: 'PROJECT_DETAIL', description: 'Energy system impacts of the project.', cadence: 'once' },
            { key: 'INFRASTRUCTURE_COST_REDUCTIONS', label: 'Infrastructure Cost Reductions', table: 'PROJECT_DETAIL', description: 'Infrastructure cost reductions and other economic benefits.', cadence: 'once' },
            { key: 'OTHER_IMPACTS', label: 'Other Impacts', table: 'PROJECT_DETAIL', description: 'Other notable project impacts.', cadence: 'once' },
            { key: 'INFORMATION_DISSEMINATION', label: 'Information Dissemination', table: 'PROJECT_DETAIL', description: 'How findings and results are disseminated.', cadence: 'once' },
        ],
    },
];

// ─── Mapping: stage requirement key → form field key(s) ──────────────
// Some stage keys map to multiple form fields (e.g. contact = first+last+email).
// A composite key is "filled" when ALL its parts have values.
// A "group" key is "filled" when ANY of its parts has a value (for multi-selects
// where having at least one satisfies the requirement).

type FieldMapping = {
    formKeys: (keyof ProjectFormData)[];
    mode: 'all' | 'any';     // 'all' = every field must be filled; 'any' = at least one
};

export const STAGE_KEY_TO_FORM: Record<string, FieldMapping> = {
    // ── Entry ──
    PROJECT_NAME:              { formKeys: ['projectName'], mode: 'all' },
    PROJECT_NUMBER:            { formKeys: ['projectNumber'], mode: 'all' },
    PROJECT_STATUS:            { formKeys: ['projectStatus'], mode: 'all' },
    PROJECT_LEAD:              { formKeys: ['leadCompanyId'], mode: 'all' },
    PROJECT_LEAD_CONTACT:      { formKeys: ['contactFirstName', 'contactLastName', 'contactEmail'], mode: 'all' },
    EPIC_PERIOD:               { formKeys: ['investmentPeriodId'], mode: 'all' },
    INVESTMENT_AREAS:          { formKeys: ['investmentAreaIds'], mode: 'any' },
    PROGRAM_ADMIN:             { formKeys: ['programAdminId'], mode: 'all' },
    PROJECT_TYPE:              { formKeys: ['projectTypeId'], mode: 'all' },
    ADMIN_PROJECT_MANAGER: { formKeys: ['contactFirstName', 'contactLastName', 'contactEmail', 'cecMgrFirstName', 'cecMgrLastName', 'cecMgrEmail'], mode: 'any' },
    ASSEMBLY_DISTRICT:         { formKeys: ['assemblyDistrictBeforeId', 'assemblyDistrictAfterId'], mode: 'any' },
    SENATE_DISTRICT:           { formKeys: ['senateDistrictBeforeId', 'senateDistrictAfterId'], mode: 'any' },
    CLASSIFICATION_OF_BUSINESS:{ formKeys: ['businessClassificationIds'], mode: 'any' },
    UTILITY_SERVICE_AREA:      { formKeys: ['utilityServiceAreaIds'], mode: 'any' },

    // ── Active ──
    PROJECT_AWARD_DATE:        { formKeys: ['projectAwardDate'], mode: 'all' },
    PROJECT_START_DATE:        { formKeys: ['startDate'], mode: 'all' },
    PROJECT_END_DATE:          { formKeys: ['endDate'], mode: 'all' },
    SUMMARY_PROJECT_DESCRIPTION: { formKeys: ['projectSummary'], mode: 'all' },
    DETAILED_PROJECT_DESCRIPTION: { formKeys: ['detailedDescription'], mode: 'all' },
    PROJECT_GOALS:             { formKeys: ['projectSummary'], mode: 'all' },  // goals live in summary
    DELIVERABLES:              { formKeys: ['deliverables'], mode: 'all' },
    STATE_POLICY_SUPPORT_TEXT: { formKeys: ['statePolicySupport'], mode: 'all' },
    TECHNICAL_BARRIERS:        { formKeys: ['technicalBarriers'], mode: 'all' },
    MARKET_BARRIERS:           { formKeys: ['marketBarriers'], mode: 'all' },
    KEY_INNOVATIONS:           { formKeys: ['keyInnovations'], mode: 'all' },
    GETTING_TO_SCALE:          { formKeys: ['gettingToScale'], mode: 'all' },
    PROJECTED_PROJECT_BENEFITS:{ formKeys: ['projectedProjectBenefits'], mode: 'all' },
    COMMITED_FUNDING_AMT:      { formKeys: ['committedFundingAmt'], mode: 'all' },
    FUNDS_EXPENDED_TO_DATE:    { formKeys: ['fundsExpended'], mode: 'all' },
    MATCH_FUNDING:             { formKeys: ['matchFundingSplit'], mode: 'all' },
    LEVERAGED_FUNDS:           { formKeys: ['leveragedFunds'], mode: 'all' },
    CONTRACT_AMOUNT:           { formKeys: ['contractAmount'], mode: 'all' },
    ENCUMBERED_FUNDING_AMT:    { formKeys: ['encumberedFunding'], mode: 'all' },
    ADMIN_OVERHEAD_COST:       { formKeys: ['adminAndOverheadCost'], mode: 'all' },
    TOTAL_MATCH_FUNDING:       { formKeys: ['matchFundingSplit'], mode: 'all' },  // derived from split
    MATCH_FUNDING_PARTNERS:    { formKeys: ['matchFundingPartnerIds'], mode: 'any' },
    CPUC_DACLI:                { formKeys: ['cpucDac', 'cpucLi'], mode: 'any' },
    COMMUNITY_BENEFITS:        { formKeys: ['communityBenefits'], mode: 'all' },
    CYBER_SECURITY_CONSIDERATIONS: { formKeys: ['cyberSecurityConsiderations'], mode: 'all' },
    ENERGY_EFFICIENCY_WORKPAPER:   { formKeys: ['isEnergyEfficiencyWorkpaperProduced'], mode: 'all' },
    DEVELOPMENT_STAGES:        { formKeys: ['developmentStageIds'], mode: 'any' },
    CPUC_PROCEEDINGS:          { formKeys: ['cpucProceedingIds'], mode: 'any' },
    PROJECT_PARTNERS:          { formKeys: ['partnerCompanyIds'], mode: 'any' },
    PROJECT_UPDATE:            { formKeys: ['projectUpdate'], mode: 'all' },
    ELEC_RELIABILITY_IMPACTS:  { formKeys: ['electricitySystemReliabilityImpact'], mode: 'all' },
    ELEC_SAFETY_IMPACTS:       { formKeys: ['electricitySystemSafetyImpact'], mode: 'all' },
    POLICY_REGULATORY_BARRIERS:{ formKeys: ['policyAndRegulatoryBarriers'], mode: 'all' },

    // ── Closeout ──
    FINAL_REPORT_URL:          { formKeys: ['finalReportUrl'], mode: 'all' },
    KEY_LEARNINGS:             { formKeys: ['keyLearnings'], mode: 'all' },
    SCALABILITY:               { formKeys: ['scalability'], mode: 'all' },
    STANDARDS:                 { formKeys: ['standards'], mode: 'all' },
    CONFIDENTIAL_INFO_CATEGORIES: { formKeys: ['confidentialInformationCategoryIds'], mode: 'any' },
    CYBERSECURITY_NARRATIVE:   { formKeys: ['cyberSecurityNarrative'], mode: 'all' },
    GHG_IMPACTS:               { formKeys: ['ghgImpacts'], mode: 'all' },
    ENVIRONMENTAL_IMPACT_NON_GHG: { formKeys: ['environmentalImpactNonGhg'], mode: 'all' },
    RATEPAYER_BENEFITS:        { formKeys: ['ratepayersBenefits'], mode: 'all' },
    COMMUNITY_BENEFITS_DESC:   { formKeys: ['communityBenefitsDesc'], mode: 'all' },
    ENERGY_IMPACTS:            { formKeys: ['energyImpact'], mode: 'all' },
    INFRASTRUCTURE_COST_REDUCTIONS: { formKeys: ['infrastructureCostReductions'], mode: 'all' },
    OTHER_IMPACTS:             { formKeys: ['otherImpacts'], mode: 'all' },
    INFORMATION_DISSEMINATION: { formKeys: ['informationDissemination'], mode: 'all' },
};

// ─── Check whether a single form field is "filled" ───────────────────

function isFieldFilled(data: ProjectFormData, key: keyof ProjectFormData): boolean {
    const val = data[key];
    if (val === null || val === undefined) return false;
    if (typeof val === 'boolean') return true;            // booleans are always "set" (false is valid)
    if (typeof val === 'string') return val.trim() !== '';
    if (typeof val === 'number') return true;             // any numeric ID counts
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object' && 'name' in val) return true; // image object
    return false;
}

// ─── Check whether a stage requirement key is satisfied ──────────────

export function isStageFieldFilled(data: ProjectFormData, stageKey: string): boolean {
    const mapping = STAGE_KEY_TO_FORM[stageKey];
    if (!mapping) return false;
    const { formKeys, mode } = mapping;
    if (mode === 'any') {
        return formKeys.some((k) => isFieldFilled(data, k));
    }
    return formKeys.every((k) => isFieldFilled(data, k));
}

// ─── Compute per-stage progress ──────────────────────────────────────

export interface StageProgress {
    stage: string;
    description: string;
    total: number;
    filled: number;
    percent: number;
    fields: { key: string; label: string; filled: boolean }[];
}

export function computeStageProgress(data: ProjectFormData): StageProgress[] {
    return STAGE_REQUIREMENTS.map((s) => {
        const fields = s.fields.map((f) => ({
            key: f.key,
            label: f.label,
            filled: isStageFieldFilled(data, f.key),
        }));
        const filled = fields.filter((f) => f.filled).length;
        return {
            stage: s.stage,
            description: s.description,
            total: fields.length,
            filled,
            percent: fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0,
            fields,
        };
    });
}

// ─── Get the set of Entry-stage form field keys (for required markers) ──

export function getEntryRequiredFormKeys(): Set<keyof ProjectFormData> {
    const entryStage = STAGE_REQUIREMENTS.find((s) => s.stage === 'Entry');
    if (!entryStage) return new Set();
    const keys = new Set<keyof ProjectFormData>();
    for (const field of entryStage.fields) {
        const mapping = STAGE_KEY_TO_FORM[field.key];
        if (mapping) {
            for (const k of mapping.formKeys) keys.add(k);
        }
    }
    return keys;
}

// ─── Validate Entry stage — returns list of missing field labels ─────

export function validateEntryStage(data: ProjectFormData): string[] {
    const entryStage = STAGE_REQUIREMENTS.find((s) => s.stage === 'Entry');
    if (!entryStage) return [];
    return entryStage.fields
        .filter((f) => !isStageFieldFilled(data, f.key))
        .map((f) => f.label);
}
