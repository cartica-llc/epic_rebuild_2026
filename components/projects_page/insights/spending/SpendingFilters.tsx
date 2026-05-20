// components/projects_page/insights/spending/SpendingFilters.tsx

'use client';

import { ChevronDown } from 'lucide-react';
import type { SpendingFilters as Filters } from './useSpendingFilters';

interface SpendingFiltersProps {
    filters: Filters;
    periods: string[];
    areas: string[];
    onPeriodChange: (p: string) => void;
    onAreaChange: (a: string) => void;
    onReset: () => void;
    optionsLoading?: boolean;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
}

function SelectField({ label, value, onChange, options, disabled }: SelectFieldProps) {
    return (
        <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
}

export function SpendingFilters({
                                    filters,
                                    periods,
                                    areas,
                                    onPeriodChange,
                                    onAreaChange,
                                    onReset,
                                    optionsLoading,
                                }: SpendingFiltersProps) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
                label="EPIC Period"
                value={filters.period}
                onChange={onPeriodChange}
                disabled={optionsLoading}
                options={[
                    { value: 'all', label: 'All Periods' },
                    ...periods.map((p) => ({ value: p, label: p })),
                ]}
            />

            <SelectField
                label="Investment Area"
                value={filters.area}
                onChange={onAreaChange}
                disabled={optionsLoading}
                options={[
                    { value: 'all', label: 'All Areas' },
                    ...areas.map((a) => ({ value: a, label: a })),
                ]}
            />

            <div className="sm:col-span-2">
                <button
                    type="button"
                    onClick={onReset}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                    Reset filters
                </button>
            </div>
        </div>
    );
}