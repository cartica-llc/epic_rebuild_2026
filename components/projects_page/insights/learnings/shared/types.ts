// components/projects_page/insights/learnings/shared/types.ts

export type NarrativeLens = 'innovations' | 'barriers' | 'learnings' | 'summary';


export interface LearningsProject {
    id: number;
    projectNumber: string | null;
    projectName: string | null;
    projectStatus: string | null;
    projectLead: string | null;
    committedFunding: number;
    investmentAreas: string[];
    cpucProceedings: string[];
    narrative: string | null;
    narrativeSource: NarrativeLens | null;
}

export interface LensOption {
    key: NarrativeLens;
    label: string;
}

export const LENS_OPTIONS: LensOption[] = [
    { key: 'innovations', label: 'Innovations' },
    { key: 'barriers', label: 'Challenges / Barriers' },
    { key: 'learnings', label: 'Learnings' },
    { key: 'summary', label: 'Summary' },
];

export const STARTER_TOPICS = [
    'Hydropower',
    'Climate',
    'Resilience',
    'Building Decarbonization',
    'Direct Current',
    'Microgrid',
];
