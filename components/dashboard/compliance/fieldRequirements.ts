import { AUDIT_REQUIREMENTS, ANNUAL_GATE_DAYS } from './auditRequirements';
import type { StageDef } from './types';

export const STAGE_REQUIREMENTS: StageDef[] = AUDIT_REQUIREMENTS;

export const ALL_FIELD_KEYS: string[] = STAGE_REQUIREMENTS.flatMap((s) => s.fields.map((f) => f.key));

export { ANNUAL_GATE_DAYS };

export const STALE_THRESHOLD_DAYS = 90;

export const PROJECTS_PER_PAGE = 15;