import {
    ANNUAL_GATE_DAYS,
    STAGE_REQUIREMENTS,
    STALE_THRESHOLD_DAYS,
} from './fieldRequirements';
import type {
    ComplianceLevel,
    ComplianceProject,
    ConsistencyFlag,
    EnrichedProject,
    Flag,
    OverallCompliance,
    StageCompliance,
    StageDef,
    StageName,
} from './types';

export function daysBetween(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatCurrency(n: number): string {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
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

export function applicableStages(
    status: string,
    projectStartDate: Date | null,
    today: Date,
): StageName[] {
    if (isCompletedStatus(status)) return ['Initial', 'Annual', 'End'];

    const pastFirstYear = projectStartDate !== null && daysBetween(projectStartDate, today) >= ANNUAL_GATE_DAYS;
    if (pastFirstYear) return ['Initial', 'Annual'];

    return ['Initial'];
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
    project: { projectStatus: string; projectStartDate: Date | null; fieldStatus: Record<string, boolean> },
    today: Date,
): OverallCompliance {
    const stages = applicableStages(project.projectStatus, project.projectStartDate, today);
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

const DEADLINE_APPROACHING_DAYS = 45;
const STALLED_PENDING_DAYS = 180;

export function computeFlags(
    project: {
        projectStatus: string;
        endDate: Date | null;
        lastUpdate: Date | null;
        projectStartDate: Date | null;
        projectAwardDate: Date | null;
        fieldStatus: Record<string, boolean>;
    },
    today: Date,
): Flag[] {
    const flags: Flag[] = [];

    const isCompleted = isCompletedStatus(project.projectStatus);
    const isActiveOrPending =
        isActiveStatus(project.projectStatus) || isPendingStatus(project.projectStatus);

    if (project.endDate && !isCompleted && daysBetween(project.endDate, today) > 0) {
        const daysOver = daysBetween(project.endDate, today);
        flags.push({
            id: 'past-end-date',
            label: 'Past End Date',
            severity: 'critical',
            detail: `Ended ${formatDate(project.endDate)} — ${daysOver} day${daysOver === 1 ? '' : 's'} overdue`,
        });
    }

    let approachingDeadlineStale = false;
    if (project.endDate && project.lastUpdate && !isCompleted) {
        const daysUntilEnd = daysBetween(today, project.endDate);
        const daysSinceUpdate = daysBetween(project.lastUpdate, today);
        if (daysUntilEnd >= 0 && daysUntilEnd <= DEADLINE_APPROACHING_DAYS && daysSinceUpdate > STALE_THRESHOLD_DAYS) {
            approachingDeadlineStale = true;
            flags.push({
                id: 'approaching-deadline-stale',
                label: 'Approaching Deadline, Stale',
                severity: 'critical',
                detail: `Ends ${formatDate(project.endDate)} (in ${daysUntilEnd}d) but last modified ${daysAgoLabel(project.lastUpdate, today)}`,
            });
        }
    }

    if (project.lastUpdate && isActiveOrPending && !approachingDeadlineStale) {
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

    if (isCompleted) {
        const annualTier = STAGE_REQUIREMENTS.find((s) => s.stage === 'Annual')!;
        const endTier = STAGE_REQUIREMENTS.find((s) => s.stage === 'End')!;
        const annualMissing = annualTier.fields.filter((f) => !project.fieldStatus[f.key]).length;
        const endMissing = endTier.fields.filter((f) => !project.fieldStatus[f.key]).length;

        if (annualMissing > 0 || endMissing > 0) {
            const parts: string[] = [];
            if (annualMissing > 0) parts.push(`${annualMissing} Annual`);
            if (endMissing > 0) parts.push(`${endMissing} End`);

            flags.push({
                id: 'closed-incomplete',
                label: 'Closed Incomplete',
                severity: 'critical',
                detail: `Project is closed but ${parts.join(' + ')} field${annualMissing + endMissing === 1 ? '' : 's'} still missing`,
            });
        }
    }

    if (isCompleted && !project.fieldStatus['FINAL_REPORT_URL']) {
        flags.push({
            id: 'missing-final-report',
            label: 'Missing Final Report',
            severity: 'critical',
            detail: 'Project is marked Completed but no final report has been uploaded',
        });
    }

    if (isPendingStatus(project.projectStatus) && project.projectAwardDate && !project.projectStartDate) {
        const daysSinceAward = daysBetween(project.projectAwardDate, today);
        if (daysSinceAward > STALLED_PENDING_DAYS) {
            flags.push({
                id: 'stalled-pending',
                label: 'Stalled at Pending',
                severity: 'warning',
                detail: `Awarded ${formatDate(project.projectAwardDate)} (${daysAgoLabel(project.projectAwardDate, today)}) but no start date recorded`,
            });
        }
    }

    return flags;
}

export function computeConsistencyFlags(project: {
    projectStatus: string;
    projectStartDate: Date | null;
    projectAwardDate: Date | null;
    endDate: Date | null;
    committedFunding: number | null;
    fundsExpended: number | null;
    encumberedFunding: number | null;
}): ConsistencyFlag[] {
    const flags: ConsistencyFlag[] = [];
    const isCompleted = isCompletedStatus(project.projectStatus);

    if (
        project.projectStartDate &&
        project.endDate &&
        project.endDate.getTime() < project.projectStartDate.getTime()
    ) {
        flags.push({
            id: 'end-before-start',
            label: 'End Before Start',
            severity: 'critical',
            detail: `End date ${formatDate(project.endDate)} is before start date ${formatDate(project.projectStartDate)}`,
        });
    }

    if (isCompleted && (project.fundsExpended === null || project.fundsExpended === 0)) {
        flags.push({
            id: 'completed-zero-spend',
            label: 'Completed, $0 Expended',
            severity: 'critical',
            detail:
                project.fundsExpended === null
                    ? 'Project is marked Completed but Funds Expended to Date is missing'
                    : 'Project is marked Completed but Funds Expended to Date is $0',
        });
    }

    if (
        project.committedFunding !== null &&
        project.fundsExpended !== null &&
        project.fundsExpended > project.committedFunding
    ) {
        const over = project.fundsExpended - project.committedFunding;
        flags.push({
            id: 'overspend-budget',
            label: 'Overspend vs. Budget',
            severity: 'warning',
            detail: `Funds expended (${formatCurrency(project.fundsExpended)}) exceed committed funding (${formatCurrency(project.committedFunding)}) by ${formatCurrency(over)}`,
        });
    }

    if (
        project.projectAwardDate &&
        project.projectStartDate &&
        project.projectAwardDate.getTime() > project.projectStartDate.getTime()
    ) {
        flags.push({
            id: 'award-after-start',
            label: 'Award After Start',
            severity: 'warning',
            detail: `Award date ${formatDate(project.projectAwardDate)} is after start date ${formatDate(project.projectStartDate)}`,
        });
    }

    if (
        project.committedFunding !== null &&
        project.encumberedFunding !== null &&
        project.encumberedFunding > project.committedFunding
    ) {
        const over = project.encumberedFunding - project.committedFunding;
        flags.push({
            id: 'encumbered-exceeds-committed',
            label: 'Encumbered Exceeds Committed',
            severity: 'warning',
            detail: `Encumbered funding (${formatCurrency(project.encumberedFunding)}) exceeds committed funding (${formatCurrency(project.committedFunding)}) by ${formatCurrency(over)}`,
        });
    }

    return flags;
}

export function enrichProject(p: ComplianceProject, today: Date): EnrichedProject {
    const endDate = p.endDate ? new Date(p.endDate) : null;
    const lastUpdate = p.lastUpdate ? new Date(p.lastUpdate) : null;
    const projectStartDate = p.projectStartDate ? new Date(p.projectStartDate) : null;
    const projectAwardDate = p.projectAwardDate ? new Date(p.projectAwardDate) : null;
    const enrichedBase = { ...p, endDate, lastUpdate, projectStartDate, projectAwardDate };
    const flags = computeFlags(enrichedBase, today);
    const consistencyFlags = computeConsistencyFlags(enrichedBase);
    const compliance = overallCompliance(enrichedBase, today);
    return { ...enrichedBase, flags, consistencyFlags, compliance };
}

export function isOutOfCompliance(p: EnrichedProject): boolean {
    return p.compliance.level !== 'green' || p.flags.length > 0;
}