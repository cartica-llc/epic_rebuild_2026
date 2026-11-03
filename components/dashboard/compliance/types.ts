// components/dashboard/compliance/types.ts

export type { ClusterName, FieldScore, FieldMeta, NarrativeFieldKey, Rating } from './comprehensivenessRubric';
import type { FieldScore } from './comprehensivenessRubric';

export type Cadence = 'once' | 'if-needed' | 'quarterly' | 'annual';

export type ComplianceLevel = 'green' | 'red';

/**
 * Compliance timing tiers, per stakeholder direction (Oct 2026):
 *  - Entry             always required once the project exists
 *  - Active            always required once the project exists
 *  - After 1st Annual  required once the first annual report is due
 *                      (June 1 of the year after the start year), or on completion
 *  - Closeout          required once the project is Completed
 */
export type StageName = 'Entry' | 'Active' | 'After 1st Annual' | 'Closeout';

export interface FieldDef {
    key: string;
    label: string;
    table: string;
    description: string;
    cadence: Cadence;
    /**
     * Source of truth for whether an empty value counts against compliance.
     * `true`  → empty = non-compliant.
     * `false` → tracked and reported, but never fails a project.
     */
    required: boolean;
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
    /** Required fields filled. */
    filled: number;
    /** Required fields in this stage. */
    total: number;
    /** Required fields that are empty — these make the project non-compliant. */
    missing: FieldDef[];
    /** Optional (required: false) fields that are empty — reported, never failed. */
    optionalMissing: FieldDef[];
    complete: boolean;
}

export interface OverallCompliance {
    level: ComplianceLevel;
    filledTotal: number;
    requiredTotal: number;
    stageResults: StageCompliance[];
    /**
     * When the After-1st-Annual tier is NOT yet applicable, the date it becomes
     * due (June 1 of start year + 1). Null when the tier already applies or the
     * project has no start date to compute it from.
     */
    firstAnnualDueDate: Date | null;
}