// components/projects_page/insights/spending/FundingProgress.tsx

'use client';

import { formatCount, formatMoneyFull, formatMoneyShort, formatPct } from './shared/format';
import {
    FUNDING_COLORS,
    LAYERS,
    LAYER_LABEL,
    layersLargestFirst,
    valueForLayer,
    type FundingLayer,
    type FundingValues,
} from './shared/fundingLayers';

interface Totals extends FundingValues {
    projectCount: number;
}

interface FundingProgressProps {
    totals: Totals | null;
    loading: boolean;
    isolated: FundingLayer | null;
    onIsolate: (layer: FundingLayer | null) => void;
}

const LABEL: Record<FundingLayer, string> = {
    committed: 'Committed',
    encumbered: 'Encumbered',
    contracted: 'Contracted',
    expended: 'Expended',
};

const pctOf = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

export function FundingProgress({
                                    totals,
                                    loading,
                                    isolated,
                                    onIsolate,
                                }: FundingProgressProps) {
    const values: FundingValues = {
        committed: totals?.committed ?? 0,
        encumbered: totals?.encumbered ?? 0,
        contracted: totals?.contracted ?? 0,
        expended: totals?.expended ?? 0,
    };
    const { committed, encumbered, contracted, expended } = values;

    // Short "how far along" note under each figure.
    const sublabels: Partial<Record<FundingLayer, string>> = {
        encumbered: committed > 0 ? `${formatPct(pctOf(encumbered, committed), 0)} of committed` : undefined,
        contracted: committed > 0 ? `${formatPct(pctOf(contracted, committed), 0)} of committed` : undefined,
        expended: contracted > 0 ? `${formatPct(pctOf(expended, contracted), 0)} of contracted` : undefined,
    };

    const toggle = (layer: FundingLayer) =>
        onIsolate(isolated === layer ? null : layer);

    const visible = LAYERS.filter((l) => isolated === null || isolated === l);
    const drawOrder = layersLargestFirst(values, visible);

    // Bar widths are relative to committed (the full bar). A few projects report
    // more encumbered than committed, so cap at 100% to keep the bar in bounds.
    const widthFor = (layer: FundingLayer) =>
        layer === 'committed' ? 100 : Math.min(100, pctOf(valueForLayer(values, layer), committed));

    const ariaSummary = loading
        ? 'Loading funding breakdown'
        : isolated
            ? `Showing ${isolated} only: ${formatMoneyShort(valueForLayer(values, isolated))}`
            : `Of ${formatMoneyShort(committed)} committed, ${formatMoneyShort(encumbered)} encumbered, ${formatMoneyShort(contracted)} contracted and ${formatMoneyShort(expended)} expended`;

    return (
        <section
            aria-label="Funding overview"
            className="rounded-md border border-slate-200 bg-white p-5 md:p-6"
        >
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
                {LAYERS.map((layer) => (
                    <MetricButton
                        key={layer}
                        label={LABEL[layer]}
                        value={valueForLayer(values, layer)}
                        sublabel={sublabels[layer]}
                        layer={layer}
                        isolated={isolated}
                        onClick={toggle}
                        loading={loading}
                    />
                ))}
                <ProjectsDisplay
                    value={totals?.projectCount ?? 0}
                    loading={loading}
                />
            </div>

            <div className="mt-6">
                <div
                    className="relative h-3 overflow-hidden rounded-full bg-slate-50 ring-1 ring-inset ring-slate-200"
                    role="img"
                    aria-label={ariaSummary}
                >
                    {loading ? (
                        <div className="h-full w-full animate-pulse bg-slate-200" />
                    ) : (
                        drawOrder.map((layer) => (
                            <div
                                key={layer}
                                className={`absolute inset-y-0 left-0 transition-all duration-300 ${FUNDING_COLORS[layer].bar}`}
                                style={{ width: `${widthFor(layer)}%` }}
                                aria-hidden="true"
                            />
                        ))
                    )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-500">
                        {LAYERS.map((layer) => (
                            <LegendDot
                                key={layer}
                                color={FUNDING_COLORS[layer].dot}
                                label={LABEL[layer]}
                                muted={isolated !== null && isolated !== layer}
                            />
                        ))}
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
            aria-label={`${isActive ? 'Hide' : 'Show only'} ${LAYER_LABEL[layer]} on the funding bar`}
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