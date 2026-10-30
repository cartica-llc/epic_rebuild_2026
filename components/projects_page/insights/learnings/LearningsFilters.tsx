// components/projects_page/insights/learnings/LearningsFilters.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { ProgramAdminOption } from './useLearningsFilterOptions';

interface FilterValues {
    org: string;
    area: string;
    proceeding: string;
    status: string;
}

interface FilterOptions {
    investmentAreas: string[];
    cpucProceedings: string[];
    statuses: string[];
    programAdmins?: ProgramAdminOption[];
}

interface LearningsFiltersProps {
    values: FilterValues;
    options: FilterOptions;
    optionsLoading?: boolean;
    onOrgChange: (v: string) => void;
    onAreaChange: (v: string) => void;
    onProceedingChange: (v: string) => void;
    onStatusChange: (v: string) => void;
}

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: SelectOption[];
    allLabel?: string;
    disabled?: boolean;
}

// Most lists are plain strings where the value and label are the same.
const toOptions = (list: string[] = []): SelectOption[] =>
    list.map((v) => ({ value: v, label: v }));

function SelectField({ label, value, onChange, options, allLabel = 'All', disabled }: SelectFieldProps) {
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
                    <option value="">{allLabel}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
}

export function LearningsFilters({
                                     values,
                                     options,
                                     optionsLoading,
                                     onOrgChange,
                                     onAreaChange,
                                     onProceedingChange,
                                     onStatusChange,
                                 }: LearningsFiltersProps) {
    const [open, setOpen] = useState(false);

    const activeCount = [values.org, values.area, values.proceeding, values.status].filter(Boolean).length;

    const orgOptions: SelectOption[] = (options.programAdmins ?? []).map((o) => ({
        value: String(o.id),
        label: o.name,
    }));

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
                    open
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                Filters
                {activeCount > 0 && (
                    <span
                        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                            open
                                ? 'bg-white text-slate-900'
                                : 'bg-slate-900 text-white'
                        }`}
                    >
                        {activeCount}
                    </span>
                )}
                <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <SelectField
                                    label="Program Administrator"
                                    value={values.org}
                                    onChange={onOrgChange}
                                    options={orgOptions}
                                    allLabel="All Orgs"
                                    disabled={optionsLoading}
                                />
                                <SelectField
                                    label="Investment Area"
                                    value={values.area}
                                    onChange={onAreaChange}
                                    options={toOptions(options.investmentAreas)}
                                    disabled={optionsLoading}
                                />
                                <SelectField
                                    label="CPUC Proceeding"
                                    value={values.proceeding}
                                    onChange={onProceedingChange}
                                    options={toOptions(options.cpucProceedings)}
                                    disabled={optionsLoading}
                                />
                                <SelectField
                                    label="Project Status"
                                    value={values.status}
                                    onChange={onStatusChange}
                                    options={toOptions(options.statuses)}
                                    disabled={optionsLoading}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}