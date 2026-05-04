// components/projects_page/insights/learnings/shared/types.ts

export type NarrativeLens = 'innovations' | 'barriers' | 'learnings' | 'summary';

/**
 * Lightweight project shape returned by /api/learnings/search.
 * The `narrative` field is the snippet for the active lens (or a best-available
 * fallback when no lens is selected). It's pre-shaped on the server so we don't
 * ship long text fields we won't render.
 */
export interface LearningsProject {
    id: number;
    projectNumber: string | null;
    projectName: string | null;
    projectStatus: string | null;
    projectLead: string | null;
    committedFunding: number;
    investmentAreas: string[];
    cpucProceedings: string[];
    /** The narrative excerpt for the active lens (or null if not available). */
    narrative: string | null;
    /** Which lens the narrative came from (helps when fallback was used). */
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
