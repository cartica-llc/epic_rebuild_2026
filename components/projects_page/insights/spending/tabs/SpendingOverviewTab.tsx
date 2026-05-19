// components/projects_page/insights/spending/tabs/SpendingOverviewTab.tsx

'use client';

import { useMemo, useState } from 'react';
import { useInsightFetch } from '../shared/useInsightFetch';
import {
    ChartSkeleton,
    EmptyState,
    ErrorState,
    SectionCard,
} from '../shared/SectionCard';
import { FundingProgress } from '../FundingProgress';
import { formatCount, formatMoneyShort } from '../shared/format';
import {
    FUNDING_COLORS,
    LAYER_LABEL,
    valueForLayer,
    type FundingLayer,
} from '../shared/fundingLayers';

interface OverviewResponse {
    totals: {
        committed: number;
        contracted: number;
        expended: number;
        projectCount: number;
    };
    byArea: {
        id: number;
        name: string;
        committed: number;
        contracted: number;
        expended: number;
    }[];
    byPeriod: {
        id: number;
        period: string;
        committed: number;
        contracted: number;
        expended: number;
    }[];
    topLeads: {
        name: string;
        committed: number;
        contracted: number;
        expended: number;
        projectCount: number;
    }[];
}

interface Props {
    queryString: string;
}

const LAYERS: FundingLayer[] = ['committed', 'contracted', 'expended'];

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
                        : 'Committed vs. contracted vs. expended per period.'
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
                            committed: l.committed,
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

    return (
        <ul className="space-y-3">
            {rows.map((r) => {
                const committedPct = max > 0 ? (r.committed / max) * 100 : 0;
                const contractedPct = max > 0 ? (r.contracted / max) * 100 : 0;
                const expendedPct = max > 0 ? (r.expended / max) * 100 : 0;

                const showCommitted = isolated === null || isolated === 'committed';
                const showContracted = isolated === null || isolated === 'contracted';
                const showExpended = isolated === null || isolated === 'expended';

                // The right-side amount label tracks the isolated layer when one is active.
                const labelValue = valueForLayer(r, isolated);

                return (
                    <li key={r.label}>
                        <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                            {r.href ? (
                                <a
                                    href={r.href}
                                    className="truncate rounded-sm text-slate-700 underline-offset-2 transition hover:text-slate-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                    title={`View projects for ${r.label}`}
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

                        <div className="relative h-2.5 overflow-hidden rounded-sm bg-slate-50 ring-1 ring-inset ring-slate-200">
                            {showCommitted && (
                                <div
                                    className={`absolute inset-y-0 left-0 transition-all duration-300 ${FUNDING_COLORS.committed.bar}`}
                                    style={{ width: `${committedPct}%` }}
                                    aria-hidden="true"
                                />
                            )}
                            {showContracted && (
                                <div
                                    className={`absolute inset-y-0 left-0 transition-all duration-300 ${FUNDING_COLORS.contracted.bar}`}
                                    style={{ width: `${contractedPct}%` }}
                                    aria-hidden="true"
                                />
                            )}
                            {showExpended && (
                                <div
                                    className={`absolute inset-y-0 left-0 transition-all duration-300 ${FUNDING_COLORS.expended.bar}`}
                                    style={{ width: `${expendedPct}%` }}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}