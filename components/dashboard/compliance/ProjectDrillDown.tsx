// components/dashboard/compliance/ProjectDrillDown.tsx
'use client';

import React from 'react';
import { CalendarCheck, CheckCircle2, ChevronDown, RefreshCw, XCircle } from 'lucide-react';

import type { ClusterName, FieldScore } from './comprehensivenessRubric';
import { STAGE_REQUIREMENTS } from './fieldRequirements';
import {
    applicableStages,
    daysAgoLabel,
    daysBetween,
    formatDate,
    isCompletedStatus,
    stageCompliance,
} from './helpers';
import type { EnrichedProject } from './types';
import { CadenceBadge, ComplianceBar, FlagPill } from './uiPrimitives';

const CLUSTER_ORDER: ClusterName[] = ['Foundation / Status', 'Policy / Barriers', 'Innovation / Scaling', 'Impacts / Metrics'];
// Short labels for the compact summary row — the full cluster names only
// show up once you expand into the field-level detail.
const CLUSTER_SHORT: Record<ClusterName, string> = {
    'Foundation / Status': 'Foundation',
    'Policy / Barriers': 'Policy',
    'Innovation / Scaling': 'Innovation',
    'Impacts / Metrics': 'Impacts',
};

function scoreTextClass(score: number): string {
    if (score >= 4) return 'text-teal-700';
    if (score >= 3) return 'text-amber-700';
    if (score >= 1) return 'text-orange-700';
    return 'text-rose-700';
}

// Chips for fields with no content at all (coverage=false) are intentionally
// neutral/gray, not red — "not written yet" and "written but weak" are
// different situations and shouldn't compete for the same alarm color.
function chipClass(f: FieldScore): string {
    if (!f.coverage) return 'bg-slate-100 text-slate-400 ring-slate-200';
    if (f.score >= 4) return 'bg-teal-50 text-teal-700 ring-teal-200';
    if (f.score >= 3) return 'bg-amber-50 text-amber-700 ring-amber-200';
    if (f.score >= 1) return 'bg-orange-50 text-orange-700 ring-orange-200';
    return 'bg-rose-50 text-rose-700 ring-rose-200';
}

function clusterAverage(scores: FieldScore[], cluster: ClusterName): number | null {
    const scored = scores.filter((s) => s.cluster === cluster && s.coverage);
    if (scored.length === 0) return null;
    return scored.reduce((sum, s) => sum + s.score, 0) / scored.length;
}

/**
 * Comprehensiveness for a single project. Collapsed by default to a one-line
 * cluster summary — the full 21-field breakdown is opt-in via "Show detail"
 * so the drill-down isn't dominated by it on every row.
 */
function ComprehensivenessSection({ scores }: { scores: FieldScore[] }) {
    const [expanded, setExpanded] = React.useState(false);
    if (scores.length === 0) return null;

    return (
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center justify-between gap-3 text-left"
            >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-xs font-semibold text-slate-800">Comprehensiveness</span>
                    {CLUSTER_ORDER.map((cluster) => {
                        const avg = clusterAverage(scores, cluster);
                        return (
                            <span key={cluster} className="text-[11px] text-slate-500">
                                {CLUSTER_SHORT[cluster]}{' '}
                                <span className={`font-mono font-semibold ${avg === null ? 'text-slate-300' : scoreTextClass(avg)}`}>
                                    {avg === null ? '—' : avg.toFixed(1)}
                                </span>
                            </span>
                        );
                    })}
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-500">
                    {expanded ? 'Hide' : 'Show'} field detail
                    <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </span>
            </button>

            {expanded && (
                <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
                    {CLUSTER_ORDER.map((cluster) => {
                        const fields = scores.filter((s) => s.cluster === cluster);
                        if (fields.length === 0) return null;
                        return (
                            <div key={cluster}>
                                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">{cluster}</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {fields.map((f) => (
                                        <span
                                            key={f.key}
                                            title={`${f.label} — ${f.rating}. ${f.notes}`}
                                            className={`inline-flex cursor-help items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${chipClass(f)}`}
                                        >
                                            {f.label}
                                            <span className="font-mono font-semibold">{f.coverage ? f.score : '—'}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function ProjectDrillDown({ project, today }: { project: EnrichedProject; today: Date }) {
    const stages = applicableStages(project.projectStatus);

    return (
        <div className="space-y-3 pt-1">

            {(project.flags.length > 0 || project.endDate || project.lastUpdate) && (
                <div className="space-y-2">
                    {project.flags.length > 0 && (
                        <div className="space-y-1.5">
                            {project.flags.map((flag) => (
                                <FlagPill key={flag.id} flag={flag} />
                            ))}
                        </div>
                    )}

                    {(project.endDate || project.lastUpdate) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                            {project.endDate && (
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarCheck className="h-3 w-3 text-slate-400" />
                                    End:{' '}
                                    <span className="font-medium text-slate-700">
                                        {formatDate(project.endDate)}
                                    </span>
                                    {!isCompletedStatus(project.projectStatus) &&
                                        daysBetween(project.endDate, today) > 0 && (
                                            <span className="font-semibold text-rose-600">
                                                ({daysBetween(project.endDate, today)}d overdue)
                                            </span>
                                        )}
                                </span>
                            )}
                            {project.lastUpdate && (
                                <span className="inline-flex items-center gap-1.5">
                                    <RefreshCw className="h-3 w-3 text-slate-400" />
                                    Updated:{' '}
                                    <span className="font-medium text-slate-700">
                                        {daysAgoLabel(project.lastUpdate, today)}
                                    </span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {stages.map((sName) => {
                const stageDef = STAGE_REQUIREMENTS.find((s) => s.stage === sName)!;
                const { filled, total, missing, complete } = stageCompliance(project, stageDef);

                if (complete) {
                    return (
                        <div
                            key={sName}
                            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px]"
                        >
                            <CheckCircle2 className="h-4 w-4 text-teal-600" />
                            <span className="font-semibold text-slate-700">{sName}</span>
                            <span className="text-slate-500">— all {total} fields complete</span>
                        </div>
                    );
                }

                // Use 'red' for the bar since stage is incomplete
                return (
                    <div
                        key={sName}
                        className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <XCircle className="h-4 w-4 text-rose-600" />
                                <span className="text-xs font-semibold text-slate-800">{sName} stage</span>
                                <span className="text-[11px] text-slate-500">— {missing.length} missing</span>
                            </div>
                            <span className="font-mono text-[11px] tabular-nums text-slate-500">
                                {filled}/{total}
                            </span>
                        </div>

                        <ComplianceBar filled={filled} total={total} level="red" showCount={false} />

                        {/* Single column, badge immediately after its own label — a 2-col grid
                            here made short labels look like they belonged to the field beside
                            them, since the cadence badge got pushed to the far edge of a wide cell. */}
                        <ul className="mt-3 space-y-1.5">
                            {missing.map((field) => (
                                <li
                                    key={field.key}
                                    className="flex items-center gap-2 text-[11px] text-slate-700"
                                >
                                    <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                                    <span className="truncate">{field.label}</span>
                                    <CadenceBadge cadence={field.cadence} />
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}

            <ComprehensivenessSection scores={project.comprehensiveness ?? []} />
        </div>
    );
}