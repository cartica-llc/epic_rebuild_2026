// components/projects_page/insights/market/MarketFiltersBar.tsx

'use client';

import { ChevronDown, Filter } from 'lucide-react';
import {
    MATURITY_ORDER,
    SIGNAL_BANDS,
    type MaturityStage,
    type SignalBand,
} from './shared/types';
import { MATURITY_STAGE_LABEL, SIGNAL_BAND_LABEL } from './shared/colors';
import type { MarketFilters } from './useMarketFilters';

interface MarketFiltersBarProps {
    filters: MarketFilters;
    onMaturityChange: (m: MaturityStage | null) => void;
    onBandChange: (b: SignalBand | null) => void;
    onScoreFilterChange: (s: number) => void;
    hasActiveFilters: boolean;
    onReset: () => void;
    scoreCounts?: Record<number, number>;
}

export function MarketFiltersBar({
                                     filters,
                                     onMaturityChange,
                                     onBandChange,
                                     onScoreFilterChange,
                                     hasActiveFilters,
                                     onReset,
                                     scoreCounts,
                                 }: MarketFiltersBarProps) {
    const visibleScores = [1, 2, 3, 4, 5].filter(
        (n) => scoreCounts === undefined || (scoreCounts[n] ?? 0) > 0,
    );

    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2.5 flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Filters
                </span>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="ml-auto text-[10px] text-slate-400 underline-offset-2 transition hover:text-slate-700 hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <SelectField
                    label="Maturity"
                    value={filters.maturity ?? ''}
                    onChange={(v) => onMaturityChange((v as MaturityStage) || null)}
                    options={[
                        { value: '', label: 'All Stages' },
                        ...MATURITY_ORDER.map((m) => ({ value: m, label: MATURITY_STAGE_LABEL[m] })),
                    ]}
                />

                <SelectField
                    label="Signal band"
                    value={filters.band ?? ''}
                    onChange={(v) => onBandChange((v as SignalBand) || null)}
                    options={[
                        { value: '', label: 'All Bands' },
                        ...SIGNAL_BANDS.map((b) => ({ value: b, label: SIGNAL_BAND_LABEL[b] })),
                    ]}
                />

                <SelectField
                    label="Score"
                    value={filters.scoreFilter === 0 ? '' : String(filters.scoreFilter)}
                    onChange={(v) => onScoreFilterChange(v === '' ? 0 : Number(v))}
                    options={[
                        { value: '', label: 'Any Score' },
                        ...visibleScores.map((n) => ({
                            value: String(n),
                            label: `${n} / 5`,
                        })),
                    ]}
                />
            </div>
        </div>
    );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({
                         label,
                         value,
                         onChange,
                         options,
                     }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div>
            <label className="mb-1 block text-[8.5px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white py-1.5 pl-2.5 pr-6 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
}