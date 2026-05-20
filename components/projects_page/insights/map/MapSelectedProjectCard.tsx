// components/projects_page/insights/map/MapProjectCard.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { formatMoneyShort } from '../spending/shared/format';
import type { MapProject } from './shared/types';

interface MapProjectCardProps {
    project: MapProject;
    isSelected: boolean;
    onSelect: () => void;
}

export function MapProjectCard({
                                   project,
                                   isSelected,
                                   onSelect,
                               }: MapProjectCardProps) {
    const primaryArea = project.investmentAreas[0];

    return (
        <div
            onClick={onSelect}
            role="button"
            tabIndex={0}
            aria-expanded={isSelected}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={`cursor-pointer rounded-md border bg-white transition ${
                isSelected
                    ? 'border-slate-400 bg-slate-50 ring-1 ring-inset ring-slate-300'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
        >
            {/* Summary row (always visible) */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {project.projectNumber || '—'}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold leading-tight text-slate-900">
                            {project.projectName ?? 'Untitled project'}
                        </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-semibold text-slate-900">
                        {formatMoneyShort(project.committedFunding)}
                    </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                    {primaryArea && <span>{primaryArea}</span>}
                    {project.epicPeriod && (
                        <>
                            {primaryArea && <span>·</span>}
                            <span>{project.epicPeriod}</span>
                        </>
                    )}
                    {project.projectStatus && (
                        <>
                            <span>·</span>
                            <span>{project.projectStatus}</span>
                        </>
                    )}
                    {project.city && (
                        <>
                            <span>·</span>
                            <span>{project.city}</span>
                        </>
                    )}
                    {project.cpucDacli && (
                        <span className="ml-1 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                            <span className="inline-block h-1 w-1 rounded-full bg-amber-500" />
                            DAC / LI
                        </span>
                    )}
                </div>
            </div>

            {/* Expanded section — only rendered when selected.
                Click events stop propagation so links/buttons inside don't
                re-trigger the card's onSelect collapse. */}
            {isSelected && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="border-t border-slate-200 px-3 pb-3 pt-3"
                >
                    <ExpandedDetails project={project} />
                </div>
            )}
        </div>
    );
}


// ─── Expanded details ───────────────────────────────────────────────────

function ExpandedDetails({ project }: { project: MapProject }) {
    const router = useRouter();

    // Committed is the envelope (contracted ≤ committed, expended ≤ contracted).
    // Nested overlays — largest first — match the SpendingOverviewTab pattern.
    const max = Math.max(project.committedFunding, 1);
    const committedPct = (project.committedFunding / max) * 100;
    const contractedPct = (project.contractedFunding / max) * 100;
    const expendedPct = (project.expendedFunding / max) * 100;

    const hasAdditionalFunds =
        project.matchFunding > 0 || project.leveragedFunds > 0;

    return (
        <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Funding breakdown
            </p>

            {/* Legend — matches SpendingOverviewTab ChartLegend */}
            <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-200 ring-1 ring-inset ring-slate-400" />
                    Committed
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-500" />
                    Contracted
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-700" />
                    Expended
                </span>
            </div>

            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[11px]">
                <span className="text-slate-500">EPIC funding</span>
                <span className="font-medium text-slate-900">
                    {formatMoneyShort(project.committedFunding)}
                    <span className="ml-1 font-normal text-slate-400">committed</span>
                </span>
            </div>

            <div className="relative h-2 overflow-hidden rounded-sm bg-white ring-1 ring-inset ring-slate-200">
                <div
                    className="absolute inset-y-0 left-0 bg-slate-200 transition-all duration-300"
                    style={{ width: `${committedPct}%` }}
                    aria-hidden="true"
                />
                <div
                    className="absolute inset-y-0 left-0 bg-slate-500 transition-all duration-300"
                    style={{ width: `${contractedPct}%` }}
                    aria-hidden="true"
                />
                <div
                    className="absolute inset-y-0 left-0 bg-emerald-700 transition-all duration-300"
                    style={{ width: `${expendedPct}%` }}
                    aria-hidden="true"
                />
            </div>

            <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
                <span>
                    Contracted{' '}
                    <span className="font-medium text-slate-700">
                        {formatMoneyShort(project.contractedFunding)}
                    </span>
                </span>
                <span>
                    Expended{' '}
                    <span className="font-medium text-slate-700">
                        {formatMoneyShort(project.expendedFunding)}
                    </span>
                </span>
            </div>

            {hasAdditionalFunds && (
                <div className="mt-3 border-t border-slate-200 pt-2.5">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Additional funds
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <FundChip
                            label="Match"
                            value={project.matchFunding}
                            dot="bg-sky-500"
                        />
                        <FundChip
                            label="Leveraged"
                            value={project.leveragedFunds}
                            dot="bg-violet-500"
                        />
                    </div>
                </div>
            )}

            <div className="mt-3 border-t border-slate-200 pt-2.5">
                <button
                    type="button"
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 transition hover:text-slate-900"
                >
                    View full project page
                    <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}

function FundChip({
                      label,
                      value,
                      dot,
                  }: {
    label: string;
    value: number;
    dot: string;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <span
                className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`}
                aria-hidden="true"
            />
            <div className="min-w-0">
                <p className="truncate text-[10px] text-slate-500">{label}</p>
                <p className="text-[11px] font-semibold text-slate-900">
                    {formatMoneyShort(value)}
                </p>
            </div>
        </div>
    );
}