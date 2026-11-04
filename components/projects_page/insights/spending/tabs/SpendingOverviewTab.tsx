// components/projects_page/insights/spending/tabs/SpendingOverviewTab.tsx

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useInsightFetch } from '../shared/useInsightFetch';
import {
    ChartSkeleton,
    EmptyState,
    ErrorState,
    SectionCard,
} from '../shared/SectionCard';
import { FundingProgress } from '../FundingProgress';
import { formatCount, formatMoneyFull, formatMoneyShort } from '../shared/format';
import {
    FUNDING_COLORS,
    LAYERS,
    LAYER_LABEL,
    drawOrderFor,
    isLayerHidden,
    valueForLayer,
    type FundingLayer,
} from '../shared/fundingLayers';

interface OverviewResponse {
    totals: {
        committed: number;
        encumbered: number;
        contracted: number;
        expended: number;
        projectCount: number;
    };
    byArea: {
        id: number;
        name: string;
        committed: number;
        encumbered: number;
        contracted: number;
        expended: number;
    }[];
    byPeriod: {
        id: number;
        period: string;
        committed: number;
        encumbered: number;
        contracted: number;
        expended: number;
    }[];
    topLeads: {
        id: number;
        name: string;
        committed: number;
        encumbered: number;
        contracted: number;
        expended: number;
        projectCount: number;
    }[];
}

interface Props {
    queryString: string;
}

export default function SpendingOverviewTab({ queryString }: Props) {
    const { data, loading, error } = useInsightFetch<OverviewResponse>(
        `/api/spending/overview?${queryString}`,
    );

    const [isolated, setIsolated] = useState<FundingLayer | null>(null);

    const sortedByArea = useMemo(
        () =>
            data?.byArea
                ? [...data.byArea].sort(
                    (a, b) => valueForLayer(b, isolated) - valueForLayer(a, isolated),
                )
                : [],
        [data, isolated],
    );

    const sortedTopLeads = useMemo(
        () =>
            data?.topLeads
                ? [...data.topLeads].sort(
                    (a, b) => valueForLayer(b, isolated) - valueForLayer(a, isolated),
                )
                : [],
        [data, isolated],
    );

    return (
        <div className="space-y-5">
            <FundingProgress
                totals={data?.totals ?? null}
                loading={loading}
                isolated={isolated}
                onIsolate={setIsolated}
            />

            <SectionCard
                title="Spending by investment area"
                description={
                    isolated
                        ? `Top 15 investment areas, ordered by ${LAYER_LABEL[isolated]} amount.`
                        : 'Top 15 investment areas, ordered by committed funding.'
                }
            >
                <ChartLegend isolated={isolated} onIsolate={setIsolated} />
                {loading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !sortedByArea.length ? (
                    <EmptyState message="No data for the current filters." />
                ) : (
                    <NestedBarList
                        rows={sortedByArea.map((a) => ({
                            label: a.name,
                            href: `/projects?investmentAreaId=${a.id}`,
                            committed: a.committed,
                            encumbered: a.encumbered,
                            contracted: a.contracted,
                            expended: a.expended,
                        }))}
                        isolated={isolated}
                    />
                )}
            </SectionCard>

            <SectionCard
                title="Spending by EPIC period"
                description={
                    isolated
                        ? `${LAYER_LABEL[isolated][0].toUpperCase()}${LAYER_LABEL[isolated].slice(1)} amount per period.`
                        : 'Committed vs. encumbered vs. contracted vs. expended per period.'
                }
            >
                <ChartLegend isolated={isolated} onIsolate={setIsolated} />
                {loading ? (
                    <ChartSkeleton height={180} />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !data?.byPeriod.length ? (
                    <EmptyState message="No data for the current filters." />
                ) : (
                    <NestedBarList
                        rows={data.byPeriod.map((p) => ({
                            label: p.period,
                            href: `/projects?investmentPeriodId=${p.id}`,
                            committed: p.committed,
                            encumbered: p.encumbered,
                            contracted: p.contracted,
                            expended: p.expended,
                        }))}
                        isolated={isolated}
                    />
                )}
            </SectionCard>

            <SectionCard
                title="Top project leads"
                description={
                    isolated
                        ? `Top 10 lead companies, ordered by ${LAYER_LABEL[isolated]} amount.`
                        : 'Top 10 lead companies, ordered by committed funding.'
                }
            >
                <ChartLegend isolated={isolated} onIsolate={setIsolated} />
                {loading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !sortedTopLeads.length ? (
                    <EmptyState message="No data for the current filters." />
                ) : (
                    <NestedBarList
                        rows={sortedTopLeads.map((l) => ({
                            label: l.name,
                            href: `/projects?leadCompanyId=${l.id}`,
                            committed: l.committed,
                            encumbered: l.encumbered,
                            contracted: l.contracted,
                            expended: l.expended,
                            sublabel: `${formatCount(l.projectCount)} project${l.projectCount === 1 ? '' : 's'}`,
                        }))}
                        isolated={isolated}
                    />
                )}
            </SectionCard>
        </div>
    );
}


// ─── Legend ─────────────────────────────────────────────────────────────

interface ChartLegendProps {
    isolated: FundingLayer | null;
    onIsolate: (layer: FundingLayer | null) => void;
}

function ChartLegend({ isolated, onIsolate }: ChartLegendProps) {
    return (
        <div className="-mt-2 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
            {LAYERS.map((layer) => {
                const muted = isolated !== null && isolated !== layer;
                const isActive = isolated === layer;
                return (
                    <button
                        key={layer}
                        type="button"
                        onClick={() => onIsolate(isActive ? null : layer)}
                        aria-pressed={isActive}
                        title={isActive ? 'Show all layers' : `Show only ${LAYER_LABEL[layer]}`}
                        className={`flex items-center gap-1.5 rounded-sm transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 hover:text-slate-900 ${
                            muted ? 'opacity-40' : 'opacity-100'
                        }`}
                    >
                        <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${FUNDING_COLORS[layer].dot}`}
                            aria-hidden="true"
                        />
                        <span className="capitalize">{LAYER_LABEL[layer]}</span>
                    </button>
                );
            })}
        </div>
    );
}


// ─── Nested bar list ────────────────────────────────────────────────────

interface NestedRow {
    label: string;
    committed: number;
    encumbered: number;
    contracted: number;
    expended: number;
    sublabel?: string;
    href?: string;
}

interface NestedBarListProps {
    rows: NestedRow[];
    isolated: FundingLayer | null;
}

function NestedBarList({ rows, isolated }: NestedBarListProps) {
    const max = rows.reduce((m, r) => Math.max(m, r.committed), 0);
    const [hover, setHover] = useState<{ row: NestedRow; x: number; y: number } | null>(null);

    const hide = useCallback(() => setHover(null), []);

    useEffect(() => {
        if (!hover) return;
        window.addEventListener('scroll', hide, true);
        window.addEventListener('resize', hide);
        return () => {
            window.removeEventListener('scroll', hide, true);
            window.removeEventListener('resize', hide);
        };
    }, [hover, hide]);

    const visible = LAYERS.filter((l) => isolated === null || isolated === l);
    const drawOrder = drawOrderFor(visible);

    return (
        <>
            <ul className="space-y-3">
                {rows.map((r) => {
                    // Widths are relative to the largest committed amount in the list.
                    // Capped at 100% since a few projects report more than committed.
                    const widthFor = (layer: FundingLayer) =>
                        max > 0 ? Math.min(100, (valueForLayer(r, layer) / max) * 100) : 0;

                    // The right-side amount label tracks the isolated layer when one is active.
                    const labelValue = valueForLayer(r, isolated);

                    const ariaSummary = LAYERS.map(
                        (l) => `${LAYER_LABEL[l]} ${formatMoneyShort(valueForLayer(r, l))}`,
                    ).join(', ');

                    return (
                        <li
                            key={r.label}
                            onMouseEnter={(e) => setHover({ row: r, x: e.clientX, y: e.clientY })}
                            onMouseMove={(e) => setHover({ row: r, x: e.clientX, y: e.clientY })}
                            onMouseLeave={hide}
                        >
                            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                                {r.href ? (
                                    <a
                                        href={r.href}
                                        className="truncate rounded-sm text-slate-700 underline-offset-2 transition hover:text-slate-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                    >
                                        {r.label}
                                    </a>
                                ) : (
                                    <span className="truncate text-slate-700">{r.label}</span>
                                )}

                                <span className="flex-shrink-0 font-medium text-slate-900">
                                    {formatMoneyShort(labelValue)}
                                    {isolated && (
                                        <span className="ml-1 font-normal text-slate-400">
                                            {LAYER_LABEL[isolated]}
                                        </span>
                                    )}
                                    {r.sublabel && (
                                        <span className="ml-2 font-normal text-slate-400">
                                            {r.sublabel}
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div
                                tabIndex={0}
                                role="img"
                                aria-label={`${r.label}: ${ariaSummary}`}
                                onFocus={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHover({ row: r, x: rect.left + rect.width / 2, y: rect.top });
                                }}
                                onBlur={hide}
                                className="relative h-2.5 cursor-default overflow-hidden rounded-sm bg-slate-50 outline-none ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400"
                            >
                                {drawOrder.map((layer) => (
                                    <div
                                        key={layer}
                                        className={`absolute inset-y-0 left-0 transition-all duration-300 ${FUNDING_COLORS[layer].bar}`}
                                        style={{ width: `${widthFor(layer)}%` }}
                                        aria-hidden="true"
                                    />
                                ))}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {hover && (
                <RowHoverCard
                    row={hover.row}
                    x={hover.x}
                    y={hover.y}
                    isolated={isolated}
                    visible={visible}
                />
            )}
        </>
    );
}


// ─── Row hover card ─────────────────────────────────────────────────────

const CARD_WIDTH = 240;
const EDGE_GAP = 8;

interface RowHoverCardProps {
    row: NestedRow;
    x: number;
    y: number;
    isolated: FundingLayer | null;
    visible: FundingLayer[];
}

function RowHoverCard({ row, x, y, isolated, visible }: RowHoverCardProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (ref.current) setHeight(ref.current.offsetHeight);
    }, [row]);

    if (typeof document === 'undefined') return null;

    const width = Math.min(CARD_WIDTH, window.innerWidth - EDGE_GAP * 2);
    const left = Math.max(EDGE_GAP, Math.min(x - width / 2, window.innerWidth - width - EDGE_GAP));
    const above = y - height - 12;
    const top = above >= EDGE_GAP ? above : y + 16;

    return createPortal(
        <div
            ref={ref}
            role="tooltip"
            className="pointer-events-none fixed z-[1000] rounded-md bg-slate-900 px-3 py-2.5 text-xs text-slate-50 shadow-lg"
            style={{ top, left, width, visibility: height ? 'visible' : 'hidden' }}
        >
            <p className="mb-2 truncate font-semibold">{row.label}</p>
            <ul className="space-y-1">
                {LAYERS.map((layer) => {
                    const value = valueForLayer(row, layer);
                    const dimmed = isolated !== null && isolated !== layer;
                    const hidden = !dimmed && isLayerHidden(row, layer, visible);
                    return (
                        <li
                            key={layer}
                            className={`flex items-center justify-between gap-3 ${dimmed ? 'opacity-40' : ''}`}
                        >
                            <span className="flex items-center gap-1.5">
                                <span
                                    className={`inline-block h-2 w-2 rounded-full ${FUNDING_COLORS[layer].dot}`}
                                    aria-hidden="true"
                                />
                                <span className="capitalize text-slate-300">{LAYER_LABEL[layer]}</span>
                                {hidden && (
                                    <span className="text-[10px] italic text-slate-500">
                                        hidden on bar
                                    </span>
                                )}
                            </span>
                            <span className="font-medium tabular-nums" title={formatMoneyFull(value)}>
                                {formatMoneyShort(value)}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>,
        document.body,
    );
}