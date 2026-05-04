// components/projects_page/insights/market/shared/types.ts

export const MATURITY_ORDER = [
    'Near-market',
    'Validation',
    'Development',
    'Demonstration / Build',
    'Early R&D',
    'Unstaged',
] as const;

export type MaturityStage = (typeof MATURITY_ORDER)[number];

export const SIGNAL_BANDS = ['Strong', 'Emerging', 'Early'] as const;
export type SignalBand = (typeof SIGNAL_BANDS)[number];

export interface PipelineStage {
    maturity: MaturityStage;
    projectCount: number;
}

export interface SignalMixStage {
    maturity: MaturityStage;
    strong: number;
    emerging: number;
    early: number;
    total: number;
}

export interface SignalOverall {
    band: SignalBand;
    count: number;
    avgScore: number;
}

export interface MarketProject {
    id: number;
    projectNumber: string | null;
    projectName: string | null;
    leadCompany: string | null;
    maturity: MaturityStage;
    signalScore: number;
    signalBand: SignalBand;
    investmentAreas: string[];
}
