// components/projects_page/insights/map/MapSummaryCards.tsx

'use client';

import { formatCount, formatMoneyShort } from '../spending/shared/format';
import type { MapTotals } from './shared/types';

interface MapSummaryCardsProps {
    count: number;
    totals: MapTotals;
    loading: boolean;
}

export function MapSummaryCards({ count, totals, loading }: MapSummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Projects in View" value={loading ? null : formatCount(count)} />
            <Card
                label="Committed"
                value={loading ? null : formatMoneyShort(totals.committed)}
                accent="committed"
            />
            <Card
                label="Contracted"
                value={loading ? null : formatMoneyShort(totals.contracted)}
                accent="contracted"
            />
            <Card
                label="Expended"
                value={loading ? null : formatMoneyShort(totals.expended)}
                accent="expended"
            />
        </div>
    );
}

// ─── Card ───────────────────────────────────────────────────────────────
function Card({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | null;
    accent?: 'committed' | 'contracted' | 'expended';
}) {
    const accentDot =
        accent === 'committed'
            ? 'bg-slate-200 ring-1 ring-inset ring-slate-400'
            : accent === 'contracted'
              ? 'bg-slate-500'
              : accent === 'expended'
                ? 'bg-emerald-700'
                : null;

    return (
        <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
                {accentDot && (
                    <span
                        className={`inline-block h-2 w-2 rounded-full ${accentDot}`}
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
                <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
            )}
        </div>
    );
}
