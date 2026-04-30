// components/dashboard/compliance/helpers.ts

import {
    STAGE_REQUIREMENTS,
    STALE_THRESHOLD_DAYS,
} from './fieldRequirements';
import type {
    ComplianceLevel,
    ComplianceProject,
    EnrichedProject,
    Flag,
    OverallCompliance,
    StageCompliance,
    StageDef,
    StageName,
} from './types';

// ── Date helpers ──────────────────────────────────────────────────────────

export function daysBetween(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysAgoLabel(d: Date, today: Date): string {
    const n = daysBetween(d, today);
    if (n < 0) return `in ${Math.abs(n)}d`;
    if (n === 0) return 'today';
    if (n < 60) return `${n}d ago`;
    if (n < 365) return `${Math.round(n / 30)}mo ago`;
    return `${(n / 365).toFixed(1)}yr ago`;
}


function normalizeStatus(s: string): string {
    return (s ?? '').trim().toLowerCase();
}

export function isCompletedStatus(status: string): boolean {
    const k = normalizeStatus(status);
    return (
        k === 'completed' ||
        k === 'complete' ||
        k === 'closed' ||
        k === 'closed-out' ||
        k === 'closeout' ||
        k === 'finished'
    );
}

export function isActiveStatus(status: string): boolean {
    const k = normalizeStatus(status);
    return k === 'active' || k === 'in progress' || k === 'in-progress' || k === 'ongoing';
}

export function isPendingStatus(status: string): boolean {
    const k = normalizeStatus(status);
    return k === 'pending' || k === 'awarded' || k === 'approved';
}


export function applicableStages(status: string): StageName[] {
    if (isCompletedStatus(status)) return ['Entry', 'Active', 'Closeout'];
    if (isActiveStatus(status)) return ['Entry', 'Active'];
    return ['Entry'];
}

export function stageCompliance(
    project: { fieldStatus: Record<string, boolean> },
    stage: StageDef,
): Omit<StageCompliance, 'stage'> {
    const missing = stage.fields.filter((f) => !project.fieldStatus[f.key]);
    const filled = stage.fields.length - missing.length;
    return {
        filled,
        total: stage.fields.length,
        missing,
        complete: missing.length === 0,
    };
}

export function overallCompliance(
    project: { projectStatus: string; fieldStatus: Record<string, boolean> },
): OverallCompliance {
    const stages = applicableStages(project.projectStatus);
    const stageResults: StageCompliance[] = stages.map((sName) => {
        const stageDef = STAGE_REQUIREMENTS.find((s) => s.stage === sName)!;
        return { stage: sName, ...stageCompliance(project, stageDef) };
    });
    const filledTotal = stageResults.reduce((s, r) => s + r.filled, 0);
    const requiredTotal = stageResults.reduce((s, r) => s + r.total, 0);
    const allComplete = stageResults.every((r) => r.complete);
    const level: ComplianceLevel = allComplete ? 'green' : 'red';
    return { level, filledTotal, requiredTotal, stageResults };
}

// ── Flag computation ──────────────────────────────────────────────────────

/**
 * Operational flags per the updated spec:
 *
 *   1. past-end-date     — endDate is in the past (any non-completed status).
 *   2. no-recent-update  — Pending or Active project with no MODIFIED_DATE
 *                          activity in the last STALE_THRESHOLD_DAYS (90).
 *   3. closed-incomplete — Completed project where Active or Closeout stages
 *                          have any missing required fields.
 */
export function computeFlags(
    project: {
        projectStatus: string;
        endDate: Date | null;
        lastUpdate: Date | null;
        fieldStatus: Record<string, boolean>;
    },
    today: Date,
): Flag[] {
    const flags: Flag[] = [];

    const isCompleted = isCompletedStatus(project.projectStatus);
    const isActiveOrPending =
        isActiveStatus(project.projectStatus) || isPendingStatus(project.projectStatus);

    // Rule 1 — past end date

    if (project.endDate && !isCompleted && daysBetween(project.endDate, today) > 0) {
        const daysOver = daysBetween(project.endDate, today);
        flags.push({
            id: 'past-end-date',
            label: 'Past End Date',
            severity: 'critical',
            detail: `Ended ${formatDate(project.endDate)} — ${daysOver} day${daysOver === 1 ? '' : 's'} overdue`,
        });
    }

    // Rule 2 — stale (Pending or Active, no updates in 90+ days)

    if (project.lastUpdate && isActiveOrPending) {
        const endDateInFuture =
            project.endDate !== null && daysBetween(project.endDate, today) <= 0;

        if (!endDateInFuture) {
            const daysSince = daysBetween(project.lastUpdate, today);
            if (daysSince > STALE_THRESHOLD_DAYS) {
                flags.push({
                    id: 'no-recent-update',
                    label: 'No Recent Update',
                    severity: 'warning',
                    detail: `Last modified ${formatDate(project.lastUpdate)} (${daysAgoLabel(project.lastUpdate, today)})`,
                });
            }
        }
    }

    // Rule 3 — Completed but Active/Closeout stages still have missing fields
    if (isCompleted) {
        const activeStage = STAGE_REQUIREMENTS.find((s) => s.stage === 'Active')!;
        const closeoutStage = STAGE_REQUIREMENTS.find((s) => s.stage === 'Closeout')!;
        const activeMissing = activeStage.fields.filter((f) => !project.fieldStatus[f.key]).length;
        const closeoutMissing = closeoutStage.fields.filter((f) => !project.fieldStatus[f.key]).length;

        if (activeMissing > 0 || closeoutMissing > 0) {
            const parts: string[] = [];
            if (activeMissing > 0) parts.push(`${activeMissing} Active`);
            if (closeoutMissing > 0) parts.push(`${closeoutMissing} Closeout`);

            flags.push({
                id: 'closed-incomplete',
                label: 'Closed Incomplete',
                severity: 'critical',
                detail: `Project is closed but ${parts.join(' + ')} field${activeMissing + closeoutMissing === 1 ? '' : 's'} still missing`,
            });
        }
    }

    return flags;
}

// ── Enrichment ────────────────────────────────────────────────────────────

export function enrichProject(p: ComplianceProject, today: Date): EnrichedProject {
    const endDate = p.endDate ? new Date(p.endDate) : null;
    const lastUpdate = p.lastUpdate ? new Date(p.lastUpdate) : null;
    const enrichedBase = { ...p, endDate, lastUpdate };
    const flags = computeFlags(enrichedBase, today);
    const compliance = overallCompliance(p);
    return { ...enrichedBase, flags, compliance };
}

// ── Out-of-compliance predicate ───────────────────────────────────────────


export function isOutOfCompliance(p: EnrichedProject): boolean {
    return p.compliance.level !== 'green' || p.flags.length > 0;
}