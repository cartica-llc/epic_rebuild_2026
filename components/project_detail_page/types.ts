export type ProjectCore = {
    id: number;
    projectName: string | null;
    projectNumber: string | null;
    projectStatus: string | null;
    investmentProgramPeriod: string | null;
    projectStartDate: string | null;
    projectEndDate: string | null;
    projectType: string | null;
    leadCompany: string | null;
    modifiedDate: string | null;
    createdDate: string | null;
    programAdminId: number | null;

    committedFundingAmt: number | null;
    contractAmount: number | null;
    expendedToDate: number | null;
    encumberedFundingAmount: number | null;
    matchFunding: number | null;
    leveragedFunds: number | null;

    cpucDac: boolean;
    cpucLi: boolean;

    mainImageUrl: string | null;
    mainThumbnailUrl: string | null;

    maturityStage: string | null;
};

export type ProjectDetails = {
    projectSummary: string | null;
    projectDetailText: string | null;
    projectUpdate: string | null;
    deliverables: string | null;
    keyInnovations: string | null;
    keyLearnings: string | null;
    scalability: string | null;
    gettingToScale: string | null;
    statePolicySupport: string | null;
    technicalBarriers: string | null;
    marketBarriers: string | null;
    policyAndRegulatoryBarriers: string | null;
    cybersecurityConsiderationsNar: string | null;
    isFinalReportExistsAtServer: boolean;
    finalReportUrl: string | null;

    contactPersonName: string | null;
    contactPersonTitle: string | null;
    contactPersonEmail: string | null;
    projectWebsite: string | null;

    senateDistrictBefore: string | null;
    assemblyDistrictBefore: string | null;

    standards: boolean;
    cyberSecurityConsiderations: boolean;
    isEnergyEfficiencyWorkpaperProduced: boolean;
    communityBenefits: boolean;

    projectedProjectBenefits: string | null;
    electricitySystemReliabilityImpacts: string | null;
    electricitySystemSafetyImpacts: string | null;
    ghgImpacts: string | null;
    otherEnvirionmentalImpacts: string | null;
    ratepayerImpacts: string | null;
    communityBenefitsDesc: string | null;
    energyImpacts: string | null;
    infrastructureCostReductions: string | null;
    otherImpacts: string | null;
    informationDissemination: string | null;

    investmentAreas: string[];
    developmentStages: string[];
    projectPartners: string[];
    utilityServiceAreas: string[];
    businessClassifications: string[];
};

export type FinanceDetails = {
    commitedFundingAmt: number | null;
    contractAmount: number | null;
    encumberedFundingAmount: number | null;
    expendedToDate: number | null;
    adminCost: number | null;
    matchFunding: number | null;
    matchFundingSplit: number | null;
    leveragedFunds: number | null;
    leveragedFundsSources: string | null;

    fundingMechanisms: string[];
    matchFundingPartners: string[];
    cpucProceedings: { cpucNumber: string; cpucDescription: string | null }[];
};

export type AnalyticsContext = {
    tot: {
        committed: number;
        contracted: number;
        expended: number;
        count: number;
    };
    agg: Record<string, { committed: number; count: number }>;
    dac: Record<string, { dacC: number; totC: number; dacN: number; totN: number }>;
    commercialization: {
        maturity: string;
        signalScore: number;
        signalBand: 'Strong' | 'Emerging' | 'Early';
    } | null;
    maturityCounts: Record<string, number>;
    sameStageSignalCounts: {
        strong: number;
        emerging: number;
        early: number;
        total: number;
    };
};

export type GalleryImage = {
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
};

export type ProjectImages = {
    main: string | null;
    mainThumbnail: string | null;
    gallery: GalleryImage[];
};
