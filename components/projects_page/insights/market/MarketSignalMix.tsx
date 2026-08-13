// components/projects_page/insights/market/MarketSignalMix.tsx

'use client';

import { useInsightFetch } from '../spending/shared/useInsightFetch';
import {
    ProxyTooltip,
    SIGNAL_PROXY_EXPLANATION,
    MATURITY_PROXY_EXPLANATION,
} from './ProxyTooltip';
import { MATURITY_STAGE_LABEL, SIGNAL_BAND_FILL, SIGNAL_BAND_LABEL } from './shared/colors';
import type { MaturityStage, SignalMixStage, SignalOverall } from './shared/types';

interface SignalsResponse {
    byMaturity: SignalMixStage[];
    overall: SignalOverall[];
}

interface MarketSignalMixProps {
    activeMaturity: MaturityStage | null;
    onMaturitySelect: (m: MaturityStage | null) => void;
}

export function MarketSignalMix({
                                    activeMaturity,
                                    onMaturitySelect,
                                }: MarketSignalMixProps) {
    const { data, loading, error } =
        useInsightFetch<SignalsResponse>('/api/market/signals');

    const stages = data?.byMaturity ?? [];
    const portfolioTotal = stages.reduce((s, x) => s + x.total, 0);

    const maxTotal = stages.reduce((m, s) => Math.max(m, s.total), 0);

    return (
        <section className="rounded-md border border-slate-200 bg-white p-5 md:p-6">
            <header className="mb-5">
                <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-slate-900">
                        Portfolio composition
                    </h4>
                    <ProxyTooltip {...MATURITY_PROXY_EXPLANATION} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                    Project distribution across derived maturity stages, with signal band
                    composition layered in. Click a stage to filter the table below.
                </p>
            </header>

            {loading ? (
                <SkeletonBars />
            ) : error ? (
                <ErrorState message={error} />
            ) : stages.length === 0 || portfolioTotal === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <ul className="space-y-2.5">
                        {stages.map((stage) => (
                            <StageRow
                                key={stage.maturity}
                                stage={stage}
                                maxTotal={maxTotal}
                                portfolioTotal={portfolioTotal}
                                isActive={activeMaturity === stage.maturity}
                                isDimmed={
                                    activeMaturity !== null &&
                                    activeMaturity !== stage.maturity
                                }
                                onSelect={() =>
                                    onMaturitySelect(
                                        activeMaturity === stage.maturity
                                            ? null
                                            : stage.maturity,
                                    )
                                }
                            />
                        ))}
                    </ul>

                    {/* Legend + signal proxy info */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
                            <LegendDot color={SIGNAL_BAND_FILL.Strong} label={`${SIGNAL_BAND_LABEL.Strong} (4-5)`} />
                            <LegendDot color={SIGNAL_BAND_FILL.Emerging} label={`${SIGNAL_BAND_LABEL.Emerging} (2-3)`} />
                            <LegendDot color={SIGNAL_BAND_FILL.Early} label={`${SIGNAL_BAND_LABEL.Early} (0-1)`} />
                            <span className="ml-1 inline-flex items-center gap-1 text-[10px] text-slate-400">
                                Signal score
                                <ProxyTooltip {...SIGNAL_PROXY_EXPLANATION} />
                            </span>
                        </div>

                        {activeMaturity && (
                            <button
                                type="button"
                                onClick={() => onMaturitySelect(null)}
                                className="text-[11px] font-medium text-slate-500 underline-offset-2 transition hover:text-slate-900 hover:underline"
                            >
                                Show all stages
                            </button>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}

interface StageRowProps {
    stage: SignalMixStage;
    maxTotal: number;
    portfolioTotal: number;
    isActive: boolean;
    isDimmed: boolean;
    onSelect: () => void;
}

function StageRow({
                      stage,
                      maxTotal,
                      portfolioTotal,
                      isActive,
                      isDimmed,
                      onSelect,
                  }: StageRowProps) {
    const widthPct = maxTotal > 0 ? (stage.total / maxTotal) * 100 : 0;
    const portfolioPct =
        portfolioTotal > 0 ? (stage.total / portfolioTotal) * 100 : 0;

    const strongPct = stage.total > 0 ? (stage.strong / stage.total) * 100 : 0;
    const emergingPct = stage.total > 0 ? (stage.emerging / stage.total) * 100 : 0;
    const earlyPct = stage.total > 0 ? (stage.early / stage.total) * 100 : 0;

    const isEmpty = stage.total === 0;

    return (
        <li>
            <button
                type="button"
                onClick={isEmpty ? undefined : onSelect}
                disabled={isEmpty}
                aria-pressed={isActive}
                aria-label={`${isActive ? 'Clear filter' : `Filter by ${MATURITY_STAGE_LABEL[stage.maturity]}`}: ${stage.total} projects`}
                className={`group block w-full rounded-md px-2 py-1.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                    isEmpty
                        ? 'cursor-default'
                        : isActive
                            ? 'bg-slate-50 ring-1 ring-inset ring-slate-300'
                            : 'hover:bg-slate-50'
                } ${isDimmed ? 'opacity-50' : 'opacity-100'}`}
            >
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span
                        className={`text-xs ${isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}
                    >
                        {MATURITY_STAGE_LABEL[stage.maturity]}
                    </span>
                    <span className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                            {stage.total.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400">
                            {stage.total === 1 ? 'project' : 'projects'}
                            {portfolioTotal > 0 && (
                                <span className="ml-1">
                                    · {portfolioPct.toFixed(0)}%
                                </span>
                            )}
                        </span>
                    </span>
                </div>

                {/* Bar — width is proportional to total project count */}
                <div
                    className="relative h-3 overflow-hidden rounded-sm bg-slate-50 ring-1 ring-inset ring-slate-200"
                    style={{ width: isEmpty ? '8px' : `${Math.max(widthPct, 1.5)}%` }}
                >
                    {!isEmpty && (
                        <div className="flex h-full">
                            {stage.strong > 0 && (
                                <div
                                    title={`${SIGNAL_BAND_LABEL.Strong}: ${stage.strong}`}
                                    style={{
                                        width: `${strongPct}%`,
                                        backgroundColor: SIGNAL_BAND_FILL.Strong,
                                    }}
                                />
                            )}
                            {stage.emerging > 0 && (
                                <div
                                    title={`${SIGNAL_BAND_LABEL.Emerging}: ${stage.emerging}`}
                                    style={{
                                        width: `${emergingPct}%`,
                                        backgroundColor: SIGNAL_BAND_FILL.Emerging,
                                    }}
                                />
                            )}
                            {stage.early > 0 && (
                                <div
                                    title={`${SIGNAL_BAND_LABEL.Early}: ${stage.early}`}
                                    style={{
                                        width: `${earlyPct}%`,
                                        backgroundColor: SIGNAL_BAND_FILL.Early,
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </button>
        </li>
    );
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
            />
            {label}
        </span>
    );
}

function SkeletonBars() {
    return (
        <ul className="space-y-2.5" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="px-2 py-1.5">
                    <div className="mb-1.5 flex items-baseline justify-between">
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div
                        className="h-3 animate-pulse rounded-sm bg-slate-100"
                        style={{ width: `${100 - i * 14}%` }}
                    />
                </li>
            ))}
        </ul>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center rounded-md border border-dashed border-red-200 bg-red-50 py-12">
            <p className="text-xs text-red-600">Failed to load: {message}</p>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 py-12">
            <p className="text-xs text-slate-500">No projects to display.</p>
        </div>
    );
}