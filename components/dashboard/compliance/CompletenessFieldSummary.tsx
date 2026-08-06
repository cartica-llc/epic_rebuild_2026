'use client';

import React from 'react';
import { ChevronDown, Download, SquareArrowOutUpRight } from 'lucide-react';

import { exportCompletenessFieldIssuesToExcel, type CompletenessFieldIssueRow } from './exportExcel';
import { STAGE_REQUIREMENTS } from './fieldRequirements';
import { applicableStages } from './helpers';
import type { EnrichedProject, StageName } from './types';
import { Section } from './uiPrimitives';

function projectEditHref(projectId: number): string {
    return `/projects/${projectId}/edit`;
}

type FieldRow = {
    key: string;
    label: string;
    tier: StageName;
    applicableCount: number;
    filledCount: number;
    compliancePct: number;
};

export function CompletenessFieldSummary({ projects, today }: { projects: EnrichedProject[]; today: Date }) {
    const [showAll, setShowAll] = React.useState(false);
    const [expandedKey, setExpandedKey] = React.useState<string | null>(null);
    const [isExporting, setIsExporting] = React.useState(false);

    const applicableTiersByProject = React.useMemo(() => {
        const map = new Map<number, Set<StageName>>();
        for (const p of projects) {
            map.set(p.projectId, new Set(applicableStages(p.projectStatus, p.projectStartDate, today)));
        }
        return map;
    }, [projects, today]);

    const rows = React.useMemo<FieldRow[]>(() => {
        const out: FieldRow[] = [];
        for (const tierDef of STAGE_REQUIREMENTS) {
            for (const f of tierDef.fields) {
                const applicable = projects.filter((p) => applicableTiersByProject.get(p.projectId)?.has(tierDef.stage));
                const filledCount = applicable.filter((p) => p.fieldStatus[f.key]).length;
                out.push({
                    key: f.key,
                    label: f.label,
                    tier: tierDef.stage,
                    applicableCount: applicable.length,
                    filledCount,
                    compliancePct: applicable.length > 0 ? Math.round((filledCount / applicable.length) * 1000) / 10 : 100,
                });
            }
        }
        return out.sort((a, b) => a.compliancePct - b.compliancePct);
    }, [projects, applicableTiersByProject]);

    const drilldown = React.useMemo(() => {
        if (!expandedKey) return null;
        const row = rows.find((r) => r.key === expandedKey);
        if (!row) return null;
        const missing = projects.filter(
            (p) => applicableTiersByProject.get(p.projectId)?.has(row.tier) && !p.fieldStatus[row.key],
        );
        return { missing };
    }, [expandedKey, rows, projects, applicableTiersByProject]);

    const exportRows = React.useMemo<CompletenessFieldIssueRow[]>(() => {
        return rows.flatMap((r) => {
            const missing = projects.filter(
                (p) => applicableTiersByProject.get(p.projectId)?.has(r.tier) && !p.fieldStatus[r.key],
            );
            return missing.map((project) => ({ project, fieldLabel: r.label, tier: r.tier }));
        });
    }, [rows, projects, applicableTiersByProject]);

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            await exportCompletenessFieldIssuesToExcel(exportRows, today);
        } catch (err) {
            console.error('Completeness by field export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    if (rows.length === 0) return null;

    const needsAttention = rows.filter((r) => r.compliancePct < 70).length;
    const visibleRows = showAll ? rows : rows.slice(0, 10);

    return (
        <Section
            title="Completeness by field"
            description={
                <>
                    Per-field compliance among the projects each field currently applies to — same shape as the
                    audit report&apos;s Appendix A table (Complies / Does Not Comply / Not Applicable), so it can be
                    checked directly against the doc field by field.{' '}
                    <span className="font-semibold text-slate-800">{needsAttention}</span> of {rows.length} fields
                    are below 70%. Click a field to see which projects.
                </>
            }
            collapsible
            defaultOpen={false}
            accent="amber"
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
                    <th className="py-2 px-3">Tier</th>
                    <th className="py-2 px-3 text-right">Applicable</th>
                    <th className="py-2 px-3 text-right">Complies</th>
                    <th className="py-2 pl-3 text-right">Compliance %</th>
                </tr>
                </thead>
                <tbody>
                {visibleRows.map((r) => {
                    const isOpen = expandedKey === r.key;
                    return (
                        <React.Fragment key={r.key}>
                            <tr
                                onClick={() => setExpandedKey(isOpen ? null : r.key)}
                                className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-amber-50/50"
                            >
                                <td className="py-2.5 pr-3 font-semibold text-slate-800">
                                        <span className="inline-flex items-center gap-1.5">
                                            <ChevronDown
                                                className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                            {r.label}
                                        </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">{r.tier}</td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                                    {r.applicableCount}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                                    {r.filledCount}
                                </td>
                                <td className="py-2.5 pl-3 text-right font-mono font-bold tabular-nums text-slate-700">
                                    {r.compliancePct}%
                                </td>
                            </tr>
                            {isOpen && drilldown && (
                                <tr>
                                    <td colSpan={5} className="border-l-2 border-l-amber-300 bg-slate-50 px-3 py-2.5">
                                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Missing ({drilldown.missing.length} of {r.applicableCount} applicable)
                                        </p>
                                        {drilldown.missing.length === 0 ? (
                                            <p className="text-[11px] text-slate-400">None</p>
                                        ) : (
                                            <ul className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
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
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
                </tbody>
            </table>

            {rows.length > 10 && (
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