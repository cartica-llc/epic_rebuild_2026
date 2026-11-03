// components/dashboard/compliance/fieldRequirements.ts

import { AUDIT_REQUIREMENTS, FIRST_ANNUAL_DUE_DAY, FIRST_ANNUAL_DUE_MONTH } from './auditRequirements';
import type { StageDef } from './types';

export const STAGE_REQUIREMENTS: StageDef[] = AUDIT_REQUIREMENTS;

export const ALL_FIELD_KEYS: string[] = STAGE_REQUIREMENTS.flatMap((s) => s.fields.map((f) => f.key));

export { FIRST_ANNUAL_DUE_MONTH, FIRST_ANNUAL_DUE_DAY };

export const STALE_THRESHOLD_DAYS = 90;

export const PROJECTS_PER_PAGE = 15;