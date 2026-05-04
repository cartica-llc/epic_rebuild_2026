// components/projects_page/insights/market/MarketFiltersBar.tsx

'use client';

import { ChevronDown, Filter } from 'lucide-react';
import {
    MATURITY_ORDER,
    SIGNAL_BANDS,
    type MaturityStage,
    type SignalBand,
} from './shared/types';
import type { MarketFilters } from './useMarketFilters';

interface MarketFiltersBarProps {
    filters: MarketFilters;
    onMaturityChange: (m: MaturityStage | null) => void;
    onBandChange: (b: SignalBand | null) => void;
    onMinScoreChange: (s: 0 | 3 | 4) => void;
    onNearMarketChange: (v: boolean) => void;
    hasActiveFilters: boolean;
    onReset: () => void;
}

export function MarketFiltersBar({
    filters,
    onMaturityChange,
    onBandChange,
    onMinScoreChange,
    onNearMarketChange,
    hasActiveFilters,
    onReset,
}: MarketFiltersBarProps) {
    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">Filters</span>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="ml-auto text-[11px] font-medium text-slate-500 underline-offset-2 transition hover:text-slate-900 hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* Maturity */}
                <SelectField
                    label="Maturity Stage"
                    value={filters.maturity ?? ''}
                    onChange={(v) =>
                        onMaturityChange((v as MaturityStage) || null)
                    }
                    options={[
                        { value: '', label: 'All Stages' },
                        ...MATURITY_ORDER.map((m) => ({ value: m, label: m })),
                    ]}
                />

                {/* Signal Band */}
                <SelectField
                    label="Signal Band"
                    value={filters.band ?? ''}
                    onChange={(v) => onBandChange((v as SignalBand) || null)}
                    options={[
                        { value: '', label: 'All Bands' },
                        ...SIGNAL_BANDS.map((b) => ({ value: b, label: b })),
                    ]}
                />

                {/* Score Threshold */}
                <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Min Score
                    </label>
                    <div className="flex gap-2">
                        {[
                            { value: 0 as const, label: 'Any' },
                            { value: 3 as const, label: '3+' },
                            { value: 4 as const, label: '4+' },
                        ].map((opt) => {
                            const isActive = filters.minScore === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => onMinScoreChange(opt.value)}
                                    aria-pressed={isActive}
                                    className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition ${
                                        isActive
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Near-market toggle */}
                <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Quick filter
                    </label>
                    <button
                        type="button"
                        onClick={() => onNearMarketChange(!filters.nearMarketOnly)}
                        aria-pressed={filters.nearMarketOnly}
                        disabled={filters.maturity !== null}
                        className={`w-full rounded-md px-3 py-2 text-xs font-medium transition ${
                            filters.nearMarketOnly
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                        title={
                            filters.maturity !== null
                                ? 'Disabled while a maturity stage is selected'
                                : undefined
                        }
                    >
                        Near-market only
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SelectField ────────────────────────────────────────────────────────
interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
    return (
        <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
}
