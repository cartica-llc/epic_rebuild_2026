// ─── components/project_forms/types.ts ───────────────────────────────
// Shared types, constants, and helpers for the ProjectForm system.

import { ADMIN_ID_TO_ORG, ORG_TO_ADMIN_ID } from '@/lib/permissions';


export interface LookupItem {
    id: number;
    name: string;
}

export interface LookupData {
    investmentAreas: LookupItem[];
    projectTypes: LookupItem[];
    developmentStages: LookupItem[];
    projectStatuses: string[];
    programAdmins: LookupItem[];
    businessClassifications: LookupItem[];
    investmentProgramPeriods: LookupItem[];
    cpucProceedings: LookupItem[];
    utilityServiceAreas: LookupItem[];
    assemblyDistricts: LookupItem[];
    senateDistricts: LookupItem[];
    confidentialCategories: LookupItem[];
    fundingMechanisms: LookupItem[];
    companies: LookupItem[];
}

// ─── Form Data ───────────────────────────────────────────────────────
export const PROJECT_NUMBER_MAX = 32;
export interface ProjectFormData {
    // Project tab
    projectName: string;
    programAdminId: number | '';
    projectNumber: string;
    startDate: string;
    endDate: string;
    projectAwardDate: string;
    projectStatus: string;
    projectPublicUrl: string;
    projectWebsiteUrl: string;
    mainImage: { name: string; url: string; isExisting?: boolean } | null;
    galleryImages: { name: string; url: string; isExisting?: boolean }[];
    deletedImages: string[];
    standards: boolean;
    cyberSecurityConsiderations: boolean;
    isEnergyEfficiencyWorkpaperProduced: boolean;
    communityBenefits: boolean;
    cpucDac: boolean;
    cpucLi: boolean;
    isActive: boolean;
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
    contactTitle: string;
    assemblyDistrictBeforeId: number | '';
    assemblyDistrictAfterId: number | '';
    senateDistrictBeforeId: number | '';
    senateDistrictAfterId: number | '';
    projectTypeId: number | '';
    investmentPeriodId: number | '';
    businessClassificationIds: number[];
    confidentialInformationCategoryIds: number[];
    developmentStageIds: number[];
    investmentAreaIds: number[];
    cpucProceedingIds: number[];
    leadCompanyId: number | '';
    partnerCompanyIds: number[];
    cecMgrFirstName: string;
    cecMgrLastName: string;
    cecMgrTitle: string;
    cecMgrPhone: string;
    cecMgrEmail: string;
    // Details tab
    detailedDescription: string;
    projectSummary: string;
    projectUpdate: string;
    deliverables: string;
    statePolicySupport: string;
    technicalBarriers: string;
    marketBarriers: string;
    policyAndRegulatoryBarriers: string;
    gettingToScale: string;
    keyInnovations: string;
    keyLearnings: string;
    scalability: string;
    cyberSecurityNarrative: string;
    finalReportUrl: string;
    utilityServiceAreaIds: number[];
    // Final report transient state — never sent to the DB directly.
    // The actual S3 upload/delete happens in ProjectForm.executeSave after
    // the main project save succeeds.
    pendingReportFile: unknown;            // staged File — typed as unknown to keep this module server-safe (File is browser-only)
    reportMarkedForDeletion: boolean;     // user clicked "Remove"
    // Finance tab
    fundingMechanismIds: number[];
    matchFundingPartnerIds: number[];
    committedFundingAmt: string;
    encumberedFunding: string;
    fundsExpended: string;
    adminAndOverheadCost: string;
    numOfBidders: string;
    rankOfSelectedBidders: string;
    contractAmount: string;
    leveragedFunds: string;
    matchFundingSplit: string;
    bidderDescription: string;
    // Additional tab
    electricitySystemReliabilityImpact: string;
    electricitySystemSafetyImpact: string;
    ghgImpacts: string;
    environmentalImpactNonGhg: string;
    projectedProjectBenefits: string;
    ratepayersBenefits: string;
    communityBenefitsDesc: string;
    energyImpact: string;
    infrastructureCostReductions: string;
    otherImpacts: string;
    informationDissemination: string;
}

// ─── Shared setter type ──────────────────────────────────────────────

export type FormValue = ProjectFormData[keyof ProjectFormData] | (string | number)[];
export type FormSetter = (key: string, val: FormValue) => void;

// ─── Empty form defaults ─────────────────────────────────────────────

export const EMPTY_FORM: ProjectFormData = {
    projectName: '', programAdminId: '', projectNumber: '', startDate: '', endDate: '',
    projectAwardDate: '', projectStatus: '', projectPublicUrl: '', projectWebsiteUrl: '',
    mainImage: null, galleryImages: [], deletedImages: [], standards: false, cyberSecurityConsiderations: false,
    isEnergyEfficiencyWorkpaperProduced: false, communityBenefits: false, cpucDac: false, cpucLi: false,
    isActive: true,
    contactFirstName: '', contactLastName: '', contactEmail: '', contactTitle: '',
    assemblyDistrictBeforeId: '', assemblyDistrictAfterId: '', senateDistrictBeforeId: '', senateDistrictAfterId: '',
    projectTypeId: '', investmentPeriodId: '', businessClassificationIds: [],
    confidentialInformationCategoryIds: [], developmentStageIds: [], investmentAreaIds: [],
    cpucProceedingIds: [], leadCompanyId: '', partnerCompanyIds: [],
    cecMgrFirstName: '', cecMgrLastName: '', cecMgrTitle: '', cecMgrPhone: '', cecMgrEmail: '',
    detailedDescription: '', projectSummary: '', projectUpdate: '', deliverables: '',
    statePolicySupport: '', technicalBarriers: '', marketBarriers: '', policyAndRegulatoryBarriers: '',
    gettingToScale: '', keyInnovations: '', keyLearnings: '', scalability: '',
    cyberSecurityNarrative: '', finalReportUrl: '', utilityServiceAreaIds: [],
    pendingReportFile: null, reportMarkedForDeletion: false,
    fundingMechanismIds: [], matchFundingPartnerIds: [], committedFundingAmt: '', encumberedFunding: '',
    fundsExpended: '', adminAndOverheadCost: '', numOfBidders: '', rankOfSelectedBidders: '',
    contractAmount: '', leveragedFunds: '', matchFundingSplit: '', bidderDescription: '',
    electricitySystemReliabilityImpact: '', electricitySystemSafetyImpact: '', ghgImpacts: '',
    environmentalImpactNonGhg: '', projectedProjectBenefits: '', ratepayersBenefits: '',
    communityBenefitsDesc: '', energyImpact: '', infrastructureCostReductions: '', otherImpacts: '',
    informationDissemination: '',
};

// ─── Constants ───────────────────────────────────────────────────────

// FINANCE_DETAIL columns are NUMBER(15,3) — max 12 digits before decimal
export const FINANCE_MAX = 999_999_999_999;

export const TABS = [
    { id: 'project', label: 'Project' },
    { id: 'details', label: 'Project Details' },
    { id: 'finance', label: 'Finance Details' },
    { id: 'additional', label: 'Additional Info' },
    { id: 'danger', label: 'Delete Project' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────

export function prefixForAdminId(id: number): string {
    return (ADMIN_ID_TO_ORG[id] ?? '').toUpperCase();
}

export function orgToAdminId(org: string): number | null {
    const id = ORG_TO_ADMIN_ID[org.toLowerCase().trim()];
    return id !== undefined ? id : null;
}

// ─── CSS class tokens ────────────────────────────────────────────────

export const inputClass =
    'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';

export const selectClass =
    "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8";

export const textareaClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-y min-h-[120px] leading-relaxed';

// ─── Save overlay state type ─────────────────────────────────────────

export type SaveOverlay =
    | null
    | { phase: 'saving' }
    | { phase: 'success'; projectName: string; projectNumber: string; targetId: number | string }
    | { phase: 'error'; message: string };

// ─── Field labels for change detection ───────────────────────────────

export const FIELD_LABELS: Record<string, string> = {
    projectName: 'Project Name', programAdminId: 'Program Admin',
    projectNumber: 'Project Number', startDate: 'Start Date', endDate: 'End Date',
    projectAwardDate: 'Award Date', projectStatus: 'Status',
    projectPublicUrl: 'Public URL', projectWebsiteUrl: 'Website URL',
    standards: 'Standards', cyberSecurityConsiderations: 'Cyber Security',
    isEnergyEfficiencyWorkpaperProduced: 'Energy Efficiency Workpaper',
    communityBenefits: 'Community Benefits', cpucDac: 'CPUC DAC', cpucLi: 'CPUC LI',
    isActive: 'Active / Visible',
    contactFirstName: 'Contact First Name', contactLastName: 'Contact Last Name',
    contactEmail: 'Contact Email', contactTitle: 'Contact Title',
    cecMgrFirstName: 'CEC Mgr First Name', cecMgrLastName: 'CEC Mgr Last Name',
    cecMgrTitle: 'CEC Mgr Title', cecMgrPhone: 'CEC Mgr Phone', cecMgrEmail: 'CEC Mgr Email',
    leadCompanyId: 'Lead Company', projectTypeId: 'Project Type',
    investmentPeriodId: 'Investment Period',
    assemblyDistrictBeforeId: 'Assembly District (Before)', assemblyDistrictAfterId: 'Assembly District (After)',
    senateDistrictBeforeId: 'Senate District (Before)', senateDistrictAfterId: 'Senate District (After)',
    investmentAreaIds: 'Investment Areas', developmentStageIds: 'Development Stages',
    cpucProceedingIds: 'CPUC Proceedings', businessClassificationIds: 'Business Classifications',
    utilityServiceAreaIds: 'Utility Service Areas', partnerCompanyIds: 'Partner Companies',
    fundingMechanismIds: 'Funding Mechanisms', confidentialInformationCategoryIds: 'Confidential Categories',
    matchFundingPartnerIds: 'Match Funding Partners',
    detailedDescription: 'Detailed Description', projectSummary: 'Project Summary',
    projectUpdate: 'Project Update', deliverables: 'Deliverables',
    statePolicySupport: 'State Policy Support', technicalBarriers: 'Technical Barriers',
    marketBarriers: 'Market Barriers', policyAndRegulatoryBarriers: 'Policy & Regulatory Barriers',
    gettingToScale: 'Getting to Scale', keyInnovations: 'Key Innovations',
    keyLearnings: 'Key Learnings', scalability: 'Scalability',
    cyberSecurityNarrative: 'Cyber Security Narrative', finalReportUrl: 'Final Report',
    committedFundingAmt: 'Committed Funding', encumberedFunding: 'Encumbered Funding',
    fundsExpended: 'Funds Expended', adminAndOverheadCost: 'Admin & Overhead',
    numOfBidders: '# of Bidders', rankOfSelectedBidders: 'Rank of Selected Bidder',
    contractAmount: 'Contract Amount', bidderDescription: 'Bidder Description',
    leveragedFunds: 'Leveraged Funds', matchFundingSplit: 'Match Funding Split',
    electricitySystemReliabilityImpact: 'Electricity Reliability Impact',
    electricitySystemSafetyImpact: 'Electricity Safety Impact',
    ghgImpacts: 'GHG Impacts', environmentalImpactNonGhg: 'Non-GHG Environmental Impact',
    projectedProjectBenefits: 'Projected Benefits', ratepayersBenefits: 'Ratepayer Benefits',
    communityBenefitsDesc: 'Community Benefits Desc.', energyImpact: 'Energy Impact',
    infrastructureCostReductions: 'Infrastructure Cost Reductions',
    otherImpacts: 'Other Impacts', informationDissemination: 'Info Dissemination',
    mainImage: 'Main Image', galleryImages: 'Gallery Images',
};

// deletedImages, pendingReportFile, and reportMarkedForDeletion are transient
// UI state — exclude them from the change-detection diff shown to the user.
export const SKIP_FIELDS = new Set<keyof ProjectFormData>([
    'deletedImages',
    'pendingReportFile',
    'reportMarkedForDeletion',
]);