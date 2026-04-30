// components/dashboard/compliance/fieldRequirements.ts
//
// Re-exports the canonical stage definitions from project_forms so the
// compliance dashboard and the project edit form stay in lockstep.
// Cadence styling and stage colors come from StageProgressBar (also
// the single source of truth).

import { STAGE_REQUIREMENTS as RAW_STAGE_REQUIREMENTS } from '@/components/project_forms/stageRequirements';
import type { Stage as RawStage, StageField as RawStageField } from '@/components/project_forms/stageRequirements';

import type { Cadence, FieldDef, StageDef, StageName } from './types';

// Cast through the project_forms types — the field shape is identical, we
// just want our local StageName / Cadence string-literal narrowing.
export const STAGE_REQUIREMENTS: StageDef[] = (RAW_STAGE_REQUIREMENTS as RawStage[]).map((s) => ({
    stage: s.stage as StageName,
    description: s.description,
    fields: s.fields.map(
        (f: RawStageField): FieldDef => ({
            key: f.key,
            label: f.label,
            table: f.table,
            description: f.description,
            cadence: f.cadence as Cadence,
        }),
    ),
}));

export const ALL_FIELD_KEYS: string[] = STAGE_REQUIREMENTS.flatMap((s) => s.fields.map((f) => f.key));

// Threshold for the "no recent update" flag — Pending/Active projects
// without a MODIFIED_DATE change in this many days get flagged
// (provided the project's end date isn't still in the future).
export const STALE_THRESHOLD_DAYS = 90;

export const PROJECTS_PER_PAGE = 15;