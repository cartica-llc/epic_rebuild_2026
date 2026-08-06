'use client';

import React from 'react';
import { ChevronDown, Download, SquareArrowOutUpRight } from 'lucide-react';

import { FIELD_META, type NarrativeFieldKey } from './comprehensivenessRubric';
import { exportNarrativeFieldIssuesToExcel, type NarrativeFieldIssueRow } from './exportExcel';
import type { EnrichedProject } from './types';
import { Section } from './uiPrimitives';

function projectEditHref(projectId: number): string {
    return `/projects/${projectId}/edit`;
}

type Status = 'Needs attention' | 'Developing' | 'Strong';

const STATUS_STYLE: Record<Status, string> = {
    'Needs attention': 'bg-white text-rose-600 ring-1 ring-inset ring-rose-200',
    Developing: 'bg-white text-amber-600 ring-1 ring-inset ring-amber-200',
    Strong: 'bg-white text-emerald-600 ring-1 ring-inset ring-emerald-200',
};

function statusFor(completenessPct: number, avgScore: number | null): Status {
    if (completenessPct < 30 || (avgScore !== null && avgScore < 2)) return 'Needs attention';
    if (completenessPct < 70 || avgScore === null || avgScore < 3.5) return 'Developing';
    return 'Strong';
}

interface FieldRow {
    key: NarrativeFieldKey;
    label: string;
    completenessPct: number;
    avgScore: number | null;
    scoredCount: number;
    status: Status;
}

export function ComprehensivenessSummary({ projects, today }: { projects: EnrichedProject[]; today?: Date }) {
    const [showAll, setShowAll] = React.useState(false);
    const [expandedKey, setExpandedKey] = React.useState<NarrativeFieldKey | null>(null);
    const [isExporting, setIsExporting] = React.useState(false);

    const rows = React.useMemo<FieldRow[]>(() => {
        const total = projects.length;
        if (total === 0) return [];

        return FIELD_META.map((meta) => {
            const filledCount = projects.filter((p) => p.fieldStatus[meta.key]).length;
            const completenessPct = Math.round((filledCount / total) * 1000) / 10;

            const scored = projects
                .flatMap((p) => p.comprehensiveness ?? [])
                .filter((s) => s.key === meta.key && s.coverage);
            const avgScore = scored.length
                ? Math.round((scored.reduce((sum, s) => sum + s.score, 0) / scored.length) * 100) / 100
                : null;

            return {
                key: meta.key,
                label: meta.label,
                completenessPct,
                avgScore,
                scoredCount: scored.length,
                status: statusFor(completenessPct, avgScore),
            };
        }).sort((a, b) => a.completenessPct - b.completenessPct);
    }, [projects]);

    const drilldown = React.useMemo(() => {
        if (!expandedKey) return null;

        const missing = projects.filter((p) => !p.fieldStatus[expandedKey]);

        const weak = projects
            .map((p) => {
                const score = (p.comprehensiveness ?? []).find((s) => s.key === expandedKey && s.coverage);
                return score && score.score <= 2 ? { project: p, score: score.score } : null;
            })
            .filter((x): x is { project: EnrichedProject; score: number } => !!x);

        return { missing, weak };
    }, [projects, expandedKey]);

    const exportRows = React.useMemo<NarrativeFieldIssueRow[]>(() => {
        return rows.flatMap((r): NarrativeFieldIssueRow[] => {
            const missing = projects
                .filter((p) => !p.fieldStatus[r.key])
                .map((project): NarrativeFieldIssueRow => ({
                    project,
                    fieldLabel: r.label,
                    issue: 'Missing',
                    score: null,
                }));

            const weak = projects
                .map((p) => {
                    const score = (p.comprehensiveness ?? []).find((s) => s.key === r.key && s.coverage);
                    return score && score.score <= 2
                        ? ({ project: p, fieldLabel: r.label, issue: 'Weak', score: score.score } as NarrativeFieldIssueRow)
                        : null;
                })
                .filter((x): x is NarrativeFieldIssueRow => !!x);

            return [...missing, ...weak];
        });
    }, [rows, projects]);

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            await exportNarrativeFieldIssuesToExcel(exportRows, today ?? new Date());
        } catch (err) {
            console.error('Narrative field quality export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    if (rows.length === 0) return null;

    const needsAttention = rows.filter((r) => r.status === 'Needs attention').length;
    const visibleRows = showAll ? rows : rows.slice(0, 8);

    return (
        <Section
            title="Narrative field quality"
            description={
                <>
                    <span className="font-semibold text-slate-800">{needsAttention}</span> of {rows.length}{' '}
                    narrative fields need attention — either rarely filled in, or filled in but too thin to meet
                    the field&apos;s requirements. Click a field to see which projects.
                </>
            }
            collapsible
            defaultOpen={false}
            accent="indigo"
            actions={
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleExport();
                    }}
                    disabled={isExporting || exportRows.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download className="h-3 w-3" />
                    {isExporting ? 'Exporting…' : 'Export Excel'}
                </button>
            }
        >
            <table className="w-full text-left text-xs">
                <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-3">Field</th>
                    <th className="py-2 px-3 text-right">Completeness</th>
                    <th className="py-2 px-3 text-right">Writing quality</th>
                    <th className="py-2 pl-3">Status</th>
                </tr>
                </thead>
                <tbody>
                {visibleRows.map((r) => {
                    const isOpen = expandedKey === r.key;
                    return (
                        <React.Fragment key={r.key}>
                            <tr
                                onClick={() => setExpandedKey(isOpen ? null : r.key)}
                                className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                            >
                                <td className="py-2.5 pr-3 font-semibold text-slate-800">
                                        <span className="inline-flex items-center gap-1.5">
                                            <ChevronDown
                                                className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                            {r.label}
                                        </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-700">
                                    {r.completenessPct}%
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-700">
                                    {r.avgScore === null ? '—' : `${r.avgScore.toFixed(2)} / 5`}
                                </td>
                                <td className="py-2.5 pl-3">
                                        <span
                                            className={`inline-flex rounded px-2 py-1 text-[10px] font-bold ${STATUS_STYLE[r.status]}`}
                                        >
                                            {r.status}
                                        </span>
                                </td>
                            </tr>
                            {isOpen && drilldown && (
                                <tr>
                                    <td colSpan={4} className="border-l-2 border-l-indigo-300 bg-slate-50 px-3 py-2.5">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Missing ({drilldown.missing.length})
                                                </p>
                                                {drilldown.missing.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400">None</p>
                                                ) : (
                                                    <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
                                                        {drilldown.missing.map((p) => (
                                                            <li key={p.projectId} className="text-[11px]">
                                                                <a
                                                                    href={projectEditHref(p.projectId)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="group inline-flex min-w-0 items-baseline gap-2 hover:text-indigo-700"
                                                                >
                                                                        <span className="shrink-0 font-mono text-slate-500 group-hover:text-indigo-600">
                                                                            {p.projectNumber}
                                                                        </span>
                                                                    <span className="min-w-0 truncate text-slate-700 underline decoration-slate-300 underline-offset-2 group-hover:text-indigo-700 group-hover:decoration-indigo-400">
                                                                            {p.projectName}
                                                                        </span>
                                                                    <SquareArrowOutUpRight className="h-2.5 w-2.5 shrink-0 text-slate-300 group-hover:text-indigo-500" />
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div>
                                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Weak, score 0–2 ({drilldown.weak.length})
                                                </p>
                                                {drilldown.weak.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400">None</p>
                                                ) : (
                                                    <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
                                                        {drilldown.weak.map(({ project, score }) => (
                                                            <li
                                                                key={project.projectId}
                                                                className="flex items-baseline gap-2 text-[11px]"
                                                            >
                                                                <a
                                                                    href={projectEditHref(project.projectId)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="group inline-flex min-w-0 flex-1 items-baseline gap-2 hover:text-indigo-700"
                                                                >
                                                                        <span className="shrink-0 font-mono text-slate-500 group-hover:text-indigo-600">
                                                                            {project.projectNumber}
                                                                        </span>
                                                                    <span className="min-w-0 flex-1 truncate text-slate-700 underline decoration-slate-300 underline-offset-2 group-hover:text-indigo-700 group-hover:decoration-indigo-400">
                                                                            {project.projectName}
                                                                        </span>
                                                                    <SquareArrowOutUpRight className="h-2.5 w-2.5 shrink-0 text-slate-300 group-hover:text-indigo-500" />
                                                                </a>
                                                                <span className="shrink-0 font-mono font-semibold text-orange-600">
                                                                        {score}
                                                                    </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
                </tbody>
            </table>

            {rows.length > 8 && (
                <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="mt-3 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                    {showAll ? 'Show fewer fields' : `Show all ${rows.length} fields`}
                </button>
            )}
        </Section>
    );
}