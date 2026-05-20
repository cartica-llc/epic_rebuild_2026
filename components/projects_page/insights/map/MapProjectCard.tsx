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
            aria-expanded={isSelected}
            className={`overflow-hidden rounded-md border bg-white transition ${
                isSelected
                    ? 'border-slate-400 ring-1 ring-inset ring-slate-300'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
        >
            {/* Summary — the only region that toggles selection. Putting the
                handler on the button (not the outer card) means clicks inside
                the expanded panel never accidentally collapse the card. */}
            <button
                type="button"
                onClick={onSelect}
                className="block w-full cursor-pointer p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {project.projectNumber || '—'}
                            {project.epicPeriod && (
                                <>
                                    <span className="mx-1.5 text-slate-300">·</span>
                                    {project.epicPeriod}
                                </>
                            )}
                            {project.projectStatus && (
                                <>
                                    <span className="mx-1.5 text-slate-300">·</span>
                                    {project.projectStatus}
                                </>
                            )}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold leading-tight text-slate-900">
                            {project.projectName ?? 'Untitled project'}
                        </p>
                    </div>
                    {project.cpucDacli && (
                        <span className="flex-shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-inset ring-amber-200">
                            DAC / LI
                        </span>
                    )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                    {primaryArea && <span>{primaryArea}</span>}
                    {primaryArea && project.city && (
                        <span className="text-slate-300">·</span>
                    )}
                    {project.city && <span>{project.city}</span>}
                    {!isSelected && (
                        <>
                            <span className="text-slate-300">·</span>
                            <span className="font-semibold text-slate-900">
                                {formatMoneyShort(project.committedFunding)}
                            </span>
                        </>
                    )}
                </div>
            </button>

            {isSelected && (
                <ExpandedDetails project={project} />
            )}
        </div>
    );
}


// ─── Expanded details ───────────────────────────────────────────────────

function ExpandedDetails({ project }: { project: MapProject }) {
    const router = useRouter();

    const committed = project.committedFunding;
    const contracted = project.contractedFunding;
    const expended = project.expendedFunding;
    const match = project.matchFunding;
    const leveraged = project.leveragedFunds;

    // Funding lifecycle: each stage's bar width is its share of committed
    // (the envelope). Percent labels show how far each stage has advanced
    // relative to committed — making the "progress through the funnel"
    // visible at a glance without needing to do mental math.
    const safeCommitted = Math.max(committed, 1);
    const contractedPct = (contracted / safeCommitted) * 100;
    const expendedPct = (expended / safeCommitted) * 100;

    // Total capital stack: EPIC committed + match + leveraged. This is the
    // total dollar volume the project mobilized, broken down by source.
    const totalCapital = committed + match + leveraged;
    const safeTotal = Math.max(totalCapital, 1);
    const epicShare = (committed / safeTotal) * 100;
    const matchShare = (match / safeTotal) * 100;
    const leveragedShare = (leveraged / safeTotal) * 100;

    const hasAdditionalCapital = match > 0 || leveraged > 0;

    return (
        <div className="border-t border-slate-200 bg-white">
            {/* Funding lifecycle */}
            <div className="px-3 py-3">
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Funding lifecycle
                </p>

                <FunnelStage
                    label="Committed"
                    dot="bg-slate-400 ring-1 ring-inset ring-slate-400"
                    fill="bg-slate-400"
                    widthPct={100}
                    amount={committed}
                />
                <FunnelStage
                    label="Contracted"
                    dot="bg-emerald-700"
                    fill="bg-emerald-700"
                    widthPct={contractedPct}
                    amount={contracted}
                    pctOfCommitted={contractedPct}
                />
                <FunnelStage
                    label="Expended"
                    dot="bg-emerald-400"
                    fill="bg-emerald-400"
                    widthPct={expendedPct}
                    amount={expended}
                    pctOfCommitted={expendedPct}
                />
            </div>

            {/* Total capital mobilized — only show when there's outside capital,
                otherwise the EPIC committed number alone is already the headline */}
            {hasAdditionalCapital && (
                <div className="border-t border-slate-200 px-3 py-3">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            Total capital mobilized
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                            {formatMoneyShort(totalCapital)}
                        </p>
                    </div>

                    {/* Single split bar — flex weights mean widths come out
                        proportional to dollar amounts automatically. Tiny segments
                        still render thanks to a min-width on each child. */}
                    <div className="flex h-3 overflow-hidden rounded-sm bg-slate-50 ring-1 ring-inset ring-slate-200">
                        <StackSegment
                            className="bg-slate-400"
                            flex={committed}
                            label={`EPIC committed: ${formatMoneyShort(committed)}`}
                        />
                        <StackSegment
                            className="bg-amber-500"
                            flex={match}
                            label={`Match: ${formatMoneyShort(match)}`}
                        />
                        <StackSegment
                            className="bg-violet-500"
                            flex={leveraged}
                            label={`Leveraged: ${formatMoneyShort(leveraged)}`}
                        />
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-2">
                        <StackLegend
                            label="EPIC"
                            dot="bg-slate-400"
                            amount={committed}
                            sharePct={epicShare}
                        />
                        <StackLegend
                            label="Match"
                            dot="bg-amber-500"
                            amount={match}
                            sharePct={matchShare}
                        />
                        <StackLegend
                            label="Leveraged"
                            dot="bg-violet-500"
                            amount={leveraged}
                            sharePct={leveragedShare}
                        />
                    </div>
                </div>
            )}

            <div className="border-t border-slate-200 px-3 py-2.5">
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


// ─── Funnel stage row ───────────────────────────────────────────────────

function FunnelStage({
                         label,
                         dot,
                         fill,
                         widthPct,
                         amount,
                         pctOfCommitted,
                     }: {
    label: string;
    dot: string;
    fill: string;
    widthPct: number;
    amount: number;
    /** When provided, shown as a subtle annotation next to the amount. */
    pctOfCommitted?: number;
}) {
    return (
        <div className="grid grid-cols-[100px_1fr_auto] items-center gap-2.5 py-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span
                    className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${dot}`}
                    aria-hidden="true"
                />
                {label}
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-slate-50 ring-1 ring-inset ring-slate-100">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${fill}`}
                    style={{ width: `${Math.max(0, Math.min(100, widthPct))}%` }}
                    aria-hidden="true"
                />
            </div>
            <div className="flex items-baseline gap-1.5 text-right tabular-nums">
                <span className="text-[11px] font-semibold text-slate-900">
                    {formatMoneyShort(amount)}
                </span>
                {pctOfCommitted !== undefined && (
                    <span className="text-[10px] font-normal text-slate-400">
                        {Math.round(pctOfCommitted)}%
                    </span>
                )}
            </div>
        </div>
    );
}


// ─── Capital stack pieces ───────────────────────────────────────────────

function StackSegment({
                          className,
                          flex,
                          label,
                      }: {
    className: string;
    flex: number;
    label: string;
}) {
    if (flex <= 0) return null;
    return (
        <div
            className={`h-full transition-all duration-300 ${className}`}
            style={{ flex, minWidth: 2 }}
            title={label}
            aria-label={label}
        />
    );
}

function StackLegend({
                         label,
                         dot,
                         amount,
                         sharePct,
                     }: {
    label: string;
    dot: string;
    amount: number;
    sharePct: number;
}) {
    return (
        <div className="flex items-start gap-2">
            <span
                className={`mt-1 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm ${dot}`}
                aria-hidden="true"
            />
            <div className="min-w-0">
                <p className="truncate text-[10px] text-slate-500">{label}</p>
                <p className="text-[11px] font-semibold text-slate-900 tabular-nums">
                    {formatMoneyShort(amount)}
                    <span className="ml-1 font-normal text-slate-400">
                        {Math.round(sharePct)}%
                    </span>
                </p>
            </div>
        </div>
    );
}