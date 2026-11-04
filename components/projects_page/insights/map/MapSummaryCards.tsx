// components/projects_page/insights/map/MapSummaryCards.tsx

'use client';

import { formatCount, formatMoneyFull, formatMoneyShort } from '../spending/shared/format';
import { FUNDING_COLORS, type FundingLayer } from '../spending/shared/fundingLayers';
import type { MapTotals } from './shared/types';

interface MapSummaryCardsProps {
    count: number;
    totals: MapTotals;
    loading: boolean;
}

// Same order and colors as the Spending Overview cards.
const FUNDING_CARDS: { layer: FundingLayer; label: string }[] = [
    { layer: 'committed', label: 'Committed' },
    { layer: 'encumbered', label: 'Encumbered' },
    { layer: 'contracted', label: 'Contracted' },
    { layer: 'expended', label: 'Expended' },
];

export function MapSummaryCards({ count, totals, loading }: MapSummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <Card label="Projects in View" value={loading ? null : formatCount(count)} />
            {FUNDING_CARDS.map(({ layer, label }) => (
                <Card
                    key={layer}
                    label={label}
                    value={loading ? null : formatMoneyShort(totals[layer] ?? 0)}
                    fullValue={formatMoneyFull(totals[layer] ?? 0)}
                    dot={FUNDING_COLORS[layer].dot}
                />
            ))}
        </div>
    );
}

// ─── Card ───────────────────────────────────────────────────────────────
function Card({
                  label,
                  value,
                  fullValue,
                  dot,
              }: {
    label: string;
    value: string | null;
    fullValue?: string;
    dot?: string;
}) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
                {dot && (
                    <span
                        className={`inline-block h-2 w-2 rounded-full ${dot}`}
                        aria-hidden="true"
                    />
                )}
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    {label}
                </p>
            </div>
            {value === null ? (
                <div className="mt-2 h-7 w-24 animate-pulse rounded bg-slate-100" />
            ) : (
                <p className="mt-2 text-xl font-semibold text-slate-900" title={fullValue}>
                    {value}
                </p>
            )}
        </div>
    );
}