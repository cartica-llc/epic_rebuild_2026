// components/projects_page/insights/map/shared/types.ts

export interface MapProject {
    id: number;
    projectNumber: string | null;
    projectName: string | null;
    projectStatus: string | null;
    epicPeriod: string | null;
    projectLead: string | null;
    committedFunding: number;
    contractedFunding: number;
    expendedFunding: number;
    matchFunding: number;
    leveragedFunds: number;
    cpucDacli: boolean;
    investmentAreas: string[];
    latitude: number;
    longitude: number;
    city: string | null;
}

export interface MapTotals {
    committed: number;
    contracted: number;
    expended: number;
}

export interface MapFilterOptions {
    investmentAreas: string[];
}
