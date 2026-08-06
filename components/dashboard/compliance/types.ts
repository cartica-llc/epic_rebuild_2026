export type { ClusterName, FieldScore, FieldMeta, NarrativeFieldKey, Rating } from './comprehensivenessRubric';
import type { FieldScore } from './comprehensivenessRubric';

export type Cadence = 'once' | 'if-needed' | 'quarterly' | 'annual';

export type ComplianceLevel = 'green' | 'red';

export type StageName = 'Initial' | 'Annual' | 'End';

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
    | 'closed-incomplete'
    | 'missing-final-report'
    | 'stalled-pending'
    | 'approaching-deadline-stale';

export type FlagSeverity = 'critical' | 'warning';

export interface Flag {
    id: FlagId;
    label: string;
    severity: FlagSeverity;
    detail: string;
}

export type ConsistencyFlagId =
    | 'end-before-start'
    | 'completed-zero-spend'
    | 'overspend-budget'
    | 'award-after-start'
    | 'encumbered-exceeds-committed';

export interface ConsistencyFlag {
    id: ConsistencyFlagId;
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
    projectStartDate: string | null;
    projectAwardDate: string | null;
    committedFunding: number | null;
    fundsExpended: number | null;
    encumberedFunding: number | null;

    comprehensiveness: FieldScore[];
}

export interface ComplianceApiResponse {
    projects: ComplianceProject[];
    generatedAt: string;
}

export interface EnrichedProject
    extends Omit<ComplianceProject, 'endDate' | 'lastUpdate' | 'projectStartDate' | 'projectAwardDate'> {
    endDate: Date | null;
    lastUpdate: Date | null;
    projectStartDate: Date | null;
    projectAwardDate: Date | null;
    flags: Flag[];
    consistencyFlags: ConsistencyFlag[];
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