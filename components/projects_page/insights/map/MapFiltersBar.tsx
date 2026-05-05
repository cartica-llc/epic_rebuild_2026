// components/projects_page/insights/map/MapFiltersBar.tsx

'use client';

import { ChevronDown } from 'lucide-react';

interface MapFiltersBarProps {
    area: string;
    dacliOnly: boolean;
    options: { investmentAreas: string[] };
    optionsLoading?: boolean;
    onAreaChange: (v: string) => void;
    onDacliToggle: () => void;
}

export function MapFiltersBar({
                                  area,
                                  dacliOnly,
                                  options,
                                  optionsLoading,
                                  onAreaChange,
                                  onDacliToggle,
                              }: MapFiltersBarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1 sm:flex-initial">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Investment Area
                </label>
                <div className="relative">
                    <select
                        value={area}
                        onChange={(e) => onAreaChange(e.target.value)}
                        disabled={optionsLoading}
                        className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    >
                        <option value="">All Areas</option>
                        {options.investmentAreas.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Quick filter
                </label>
                <button
                    type="button"
                    onClick={onDacliToggle}
                    aria-pressed={dacliOnly}
                    className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${
                        dacliOnly
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900'
                    }`}
                    title="Show only projects in Disadvantaged Communities or Low-Income areas"
                >
                    DAC / LI only
                </button>
            </div>
        </div>
    );
}