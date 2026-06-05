// components/projects_page/insights/spending/FundingProgress.tsx

'use client';

import { formatCount, formatMoneyFull, formatMoneyShort, formatPct } from './shared/format';
import {
    FUNDING_COLORS,
    type FundingLayer,
} from './shared/fundingLayers';

interface Totals {
    committed: number;
    contracted: number;
    expended: number;
    projectCount: number;
}

interface FundingProgressProps {
    totals: Totals | null;
    loading: boolean;
    isolated: FundingLayer | null;
    onIsolate: (layer: FundingLayer | null) => void;
}

export function FundingProgress({
                                    totals,
                                    loading,
                                    isolated,
                                    onIsolate,
                                }: FundingProgressProps) {
    const committed = totals?.committed ?? 0;
    const contracted = totals?.contracted ?? 0;
    const expended = totals?.expended ?? 0;

    const contractedWidth = committed > 0 ? (contracted / committed) * 100 : 0;
    const expendedWidth = committed > 0 ? (expended / committed) * 100 : 0;
    const contractedOfCommitted = committed > 0 ? (contracted / committed) * 100 : 0;
    const expendedOfContracted = contracted > 0 ? (expended / contracted) * 100 : 0;

    const toggle = (layer: FundingLayer) =>
        onIsolate(isolated === layer ? null : layer);

    const showCommitted = isolated === null || isolated === 'committed';
    const showContracted = isolated === null || isolated === 'contracted';
    const showExpended = isolated === null || isolated === 'expended';

    return (
        <section
            aria-label="Funding overview"
            className="rounded-md border border-slate-200 bg-white p-5 md:p-6"
        >
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <MetricButton
                    label="Committed"
                    value={committed}
                    layer="committed"
                    isolated={isolated}
                    onClick={toggle}
                    loading={loading}
                />
                <MetricButton
                    label="Contracted"
                    value={contracted}
                    sublabel={
                        committed > 0
                            ? `${formatPct(contractedOfCommitted, 0)} of committed`
                            : undefined
                    }
                    layer="contracted"
                    isolated={isolated}
                    onClick={toggle}
                    loading={loading}
                />
                <MetricButton
                    label="Expended"
                    value={expended}
                    sublabel={
                        contracted > 0
                            ? `${formatPct(expendedOfContracted, 0)} of contracted`
                            : undefined
                    }
                    layer="expended"
                    isolated={isolated}
                    onClick={toggle}
                    loading={loading}
                />
                <ProjectsDisplay
                    value={totals?.projectCount ?? 0}
                    loading={loading}
                />
            </div>

            <div className="mt-6">
                <div
                    className="relative h-3 overflow-hidden rounded-full bg-slate-50 ring-1 ring-inset ring-slate-200"
                    role="img"
                    aria-label={
                        loading
                            ? 'Loading funding breakdown'
                            : isolated
                                ? `Showing ${isolated} only: ${formatMoneyShort(
                                    isolated === 'committed'
                                        ? committed
                                        : isolated === 'contracted'
                                            ? contracted
                                            : expended,
                                )}`
                                : `Of ${formatMoneyShort(committed)} committed, ${formatMoneyShort(contracted)} contracted and ${formatMoneyShort(expended)} expended`
                    }
                >
                    {loading ? (
                        <div className="h-full w-full animate-pulse bg-slate-200" />
                    ) : (
                        <>
                            {showCommitted && (
                                <div
                                    className={`absolute inset-y-0 left-0 transition-all duration-300 ${FUNDING_COLORS.committed.bar}`}
                                    style={{ width: '100%' }}
                                    aria-hidden="true"
                                />
                            )}
                            {showContracted && (
                                <div
                                    className={`absolute inset-y-0 left-0 transition-all duration-300 ${FUNDING_COLORS.contracted.bar}`}
                                    style={{ width: `${contractedWidth}%` }}
                                    aria-hidden="true"
                                />
                            )}
                            {showExpended && (
                                <div
                                    className={`absolute inset-y-0 left-0 transition-all duration-300 ${FUNDING_COLORS.expended.bar}`}
                                    style={{ width: `${expendedWidth}%` }}
                                    aria-hidden="true"
                                />
                            )}
                        </>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-500">
                        <LegendDot color={FUNDING_COLORS.committed.dot} label="Committed" muted={isolated !== null && isolated !== 'committed'} />
                        <LegendDot color={FUNDING_COLORS.contracted.dot} label="Contracted" muted={isolated !== null && isolated !== 'contracted'} />
                        <LegendDot color={FUNDING_COLORS.expended.dot} label="Expended" muted={isolated !== null && isolated !== 'expended'} />
                    </div>

                    {isolated && (
                        <button
                            type="button"
                            onClick={() => onIsolate(null)}
                            className="text-[11px] font-medium text-slate-500 underline-offset-2 transition hover:text-slate-900 hover:underline"
                        >
                            Show all
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

// ─── Internal pieces ────────────────────────────────────────────────────

interface MetricButtonProps {
    label: string;
    value: number;
    sublabel?: string;
    layer: FundingLayer;
    isolated: FundingLayer | null;
    onClick: (layer: FundingLayer) => void;
    loading: boolean;
}

function MetricButton({
                          label,
                          value,
                          sublabel,
                          layer,
                          isolated,
                          onClick,
                          loading,
                      }: MetricButtonProps) {
    const isActive = isolated === layer;
    const isDimmed = isolated !== null && isolated !== layer;

    return (
        <button
            type="button"
            onClick={() => onClick(layer)}
            disabled={loading}
            aria-pressed={isActive}
            aria-label={`${isActive ? 'Hide' : 'Show only'} ${label} on the funding bar`}
            className={`flex flex-col group -mx-2 -my-1.5 rounded-md px-2 py-1.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                isDimmed ? 'opacity-50' : 'opacity-100'
            } ${
                isActive
                    ? 'bg-slate-50 ring-1 ring-inset ring-slate-300'
                    : 'hover:bg-slate-50'
            }`}
        >
            <div className="flex items-center gap-2">
                <span
                    className={`inline-block h-2 w-2 rounded-full ${FUNDING_COLORS[layer].dot}`}
                    aria-hidden="true"
                />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                </p>
            </div>

            {loading ? (
                <div className="mt-2 h-8 w-28 animate-pulse rounded bg-slate-100" />
            ) : (
                <p
                    className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900"
                    title={formatMoneyFull(value)}
                >
                    {formatMoneyShort(value)}
                </p>
            )}

            {sublabel && !loading && (
                <p className="mt-0.5 text-[11px] text-slate-400">{sublabel}</p>
            )}
        </button>
    );
}

function ProjectsDisplay({ value, loading }: { value: number; loading: boolean }) {
    return (
        <div className="px-2 py-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Projects
            </p>
            {loading ? (
                <div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-100" />
            ) : (
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
                    {formatCount(value)}
                </p>
            )}
        </div>
    );
}

function LegendDot({
                       color,
                       label,
                       muted,
                   }: {
    color: string;
    label: string;
    muted: boolean;
}) {
    return (
        <span
            className={`flex items-center gap-1.5 transition-opacity ${muted ? 'opacity-40' : 'opacity-100'}`}
        >
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
            {label}
        </span>
    );
}