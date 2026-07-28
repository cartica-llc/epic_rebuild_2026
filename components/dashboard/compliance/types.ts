// components/dashboard/compliance/types.ts


export type { ClusterName, FieldScore, FieldMeta, NarrativeFieldKey, Rating } from './comprehensivenessRubric';
import type { FieldScore } from './comprehensivenessRubric';

export type Cadence = 'once' | 'if-needed' | 'quarterly' | 'annual';


export type ComplianceLevel = 'green' | 'red';

export type StageName = 'Entry' | 'Active' | 'Closeout';

export interface FieldDef {
    key: string;
    label: string;
    table: string;
    description: string;
    cadence: Cadence;
}

export interface StageDef {
    stage: StageName;
    description: string;
    fields: FieldDef[];
}

export type FlagId =
    | 'past-end-date'
    | 'no-recent-update'
    | 'closed-incomplete';

export type FlagSeverity = 'critical' | 'warning';

export interface Flag {
    id: FlagId;
    label: string;
    severity: FlagSeverity;
    detail: string;
}


export interface ComplianceProject {
    projectId: number;
    projectNumber: string;
    projectName: string;
    projectStatus: string;
    epicPeriod: string;
    programAdmin: string;
    fieldStatus: Record<string, boolean>;
    endDate: string | null;
    lastUpdate: string | null;
    // 0-5 comprehensiveness score per narrative field (Appendix B rubric).
    // Computed on-the-fly in the API route from the same narrative text
    // already read for completeness — always present, may be an empty
    // array only if scoring failed to run.
    comprehensiveness: FieldScore[];
}

export interface ComplianceApiResponse {
    projects: ComplianceProject[];
    generatedAt: string;
}


export interface EnrichedProject extends Omit<ComplianceProject, 'endDate' | 'lastUpdate'> {
    endDate: Date | null;
    lastUpdate: Date | null;
    flags: Flag[];
    compliance: OverallCompliance;
}

export interface StageCompliance {
    stage: StageName;
    filled: number;
    total: number;
    missing: FieldDef[];
    complete: boolean;
}

export interface OverallCompliance {
    level: ComplianceLevel;
    filledTotal: number;
    requiredTotal: number;
    stageResults: StageCompliance[];
}