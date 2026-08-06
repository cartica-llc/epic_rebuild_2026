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
import { CadenceBadge, ComplianceBar, ConsistencyFlagPill, FlagPill } from './uiPrimitives';

const CLUSTER_ORDER: ClusterName[] = ['Foundation / Status', 'Policy / Barriers', 'Innovation / Scaling', 'Impacts / Metrics'];

const CLUSTER_SHORT: Record<ClusterName, string> = {
    'Foundation / Status': 'Foundation',
    'Policy / Barriers': 'Policy',
    'Innovation / Scaling': 'Innovation',
    'Impacts / Metrics': 'Impacts',
};

function scoreTextClass(score: number): string {
    if (score >= 4) return 'text-emerald-700';
    if (score >= 3) return 'text-amber-700';
    if (score >= 1) return 'text-orange-700';
    return 'text-rose-700';
}

function clusterAverage(scores: FieldScore[], cluster: ClusterName): number | null {
    const scored = scores.filter((s) => s.cluster === cluster && s.coverage);
    if (scored.length === 0) return null;
    return scored.reduce((sum, s) => sum + s.score, 0) / scored.length;
}

type GroupTone = 'missing' | 'weak' | 'good';

const GROUP_STYLES: Record<GroupTone, { border: string; title: string; chip: string; badge: string }> = {
    missing: {
        border: 'border-slate-200',
        title: 'text-slate-600',
        chip: 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200',
        badge: 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200',
    },
    weak: {
        border: 'border-amber-200',
        title: 'text-amber-700',
        chip: 'bg-white text-amber-700 ring-1 ring-inset ring-amber-200',
        badge: 'bg-white text-amber-700 ring-1 ring-inset ring-amber-200',
    },
    good: {
        border: 'border-emerald-200',
        title: 'text-emerald-700',
        chip: 'bg-white text-emerald-700 ring-1 ring-inset ring-emerald-200',
        badge: 'bg-white text-emerald-700 ring-1 ring-inset ring-emerald-200',
    },
};

function FieldGroup({ tone, title, fields }: { tone: GroupTone; title: string; fields: FieldScore[] }) {
    if (fields.length === 0) return null;
    const style = GROUP_STYLES[tone];

    return (
        <div className={`rounded-lg border ${style.border} bg-white p-3`}>
            <div className="mb-2 flex items-center gap-2">
                <span className={`text-xs font-bold ${style.title}`}>{title}</span>
                <span className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${style.badge}`}>
                    {fields.length}
                </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {fields.map((f) => (
                    <span
                        key={f.key}
                        title={`${f.label} (${f.cluster}) — ${f.rating}. ${f.notes}`}
                        className={`inline-flex cursor-help items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${style.chip}`}
                    >
                        {f.label}
                        {f.coverage && <span className="font-mono font-bold">{f.score}</span>}
                    </span>
                ))}
            </div>
        </div>
    );
}

function ComprehensivenessSection({ scores }: { scores: FieldScore[] }) {
    const [expanded, setExpanded] = React.useState(false);
    if (scores.length === 0) return null;

    const missing = scores.filter((f) => !f.coverage);
    const weak = scores.filter((f) => f.coverage && f.score <= 2);
    const good = scores.filter((f) => f.coverage && f.score >= 3);

    return (
        <div className="rounded-lg border border-indigo-200 bg-white p-3">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center justify-between gap-3 text-left"
            >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-xs font-bold text-slate-800">Comprehensiveness</span>
                    {CLUSTER_ORDER.map((cluster) => {
                        const avg = clusterAverage(scores, cluster);
                        return (
                            <span key={cluster} className="text-[11px] font-medium text-slate-600">
                                {CLUSTER_SHORT[cluster]}{' '}
                                <span className={`font-mono font-bold ${avg === null ? 'text-slate-300' : scoreTextClass(avg)}`}>
                                    {avg === null ? '—' : avg.toFixed(1)}
                                </span>
                            </span>
                        );
                    })}
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-indigo-600">
                    {expanded ? 'Hide' : 'Show'} field detail
                    <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </span>
            </button>

            {expanded && (
                <div className="mt-3 space-y-2.5 border-t border-indigo-100 pt-3">
                    <FieldGroup tone="missing" title="Missing — never written" fields={missing} />
                    <FieldGroup tone="weak" title="Weak — written but thin (score 0–2)" fields={weak} />
                    <FieldGroup tone="good" title="Good — adequate or strong (score 3–5)" fields={good} />
                </div>
            )}
        </div>
    );
}

function DataConsistencySection({ project }: { project: EnrichedProject }) {
    if (project.consistencyFlags.length === 0) return null;

    return (
        <div className="rounded-lg border border-rose-200 bg-white p-3">
            <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-rose-700">Data consistency</span>
                <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-rose-600 ring-1 ring-inset ring-rose-200">
                    {project.consistencyFlags.length}
                </span>
            </div>
            <div className="space-y-1.5">
                {project.consistencyFlags.map((f) => (
                    <ConsistencyFlagPill key={f.id} flag={f} />
                ))}
            </div>
        </div>
    );
}

export function ProjectDrillDown({ project, today }: { project: EnrichedProject; today: Date }) {
    const stages = applicableStages(project.projectStatus, project.projectStartDate, today);

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

            <DataConsistencySection project={project} />

            {stages.map((sName) => {
                const stageDef = STAGE_REQUIREMENTS.find((s) => s.stage === sName)!;
                const { filled, total, missing, complete } = stageCompliance(project, stageDef);

                if (complete) {
                    return (
                        <div
                            key={sName}
                            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[11px]"
                        >
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="font-bold text-slate-800">{sName}</span>
                            <span className="text-slate-600">— all {total} fields complete</span>
                        </div>
                    );
                }

                return (
                    <div
                        key={sName}
                        className="rounded-lg border border-rose-200 bg-white p-3"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <XCircle className="h-4 w-4 text-rose-600" />
                                <span className="text-xs font-bold text-slate-800">{sName} stage</span>
                                <span className="text-[11px] font-medium text-slate-600">— {missing.length} missing</span>
                            </div>
                            <span className="font-mono text-[11px] font-bold tabular-nums text-slate-600">
                                {filled}/{total}
                            </span>
                        </div>

                        <ComplianceBar filled={filled} total={total} level="red" showCount={false} />

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