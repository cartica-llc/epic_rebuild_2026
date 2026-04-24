// ─── components/projects_page/projectsList/ProjectsList_Filters.tsx ─────
// Filter drawer (slides from left) + applied filter pills strip.


'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// ─── Types ───────────────────────────────────────────────────────────

type LookupOption = { id: number; name: string };

interface LookupData {
    investmentAreas: LookupOption[];
    projectTypes: LookupOption[];
    developmentStages: LookupOption[];
    projectStatuses: string[];
    programAdmins: LookupOption[];
    businessClassifications: LookupOption[];
    investmentProgramPeriods: LookupOption[];
    cpucProceedings: LookupOption[];
    utilityServiceAreas: LookupOption[];
    assemblyDistricts: LookupOption[];
    senateDistricts: LookupOption[];
}

export interface FilterValues {
    investmentAreaId: string;
    projectTypeId: string;
    developmentStageId: string;
    status: string;
    programAdminId: string;
    investmentPeriodId: string;
    cpucProceedingId: string;
    businessClassId: string;
    utilityServiceId: string;
    assemblyDistrictId: string;
    senateDistrictId: string;
    contractMin: string;
    contractMax: string;
    disadvantaged: boolean;
    lowIncome: boolean;
    communityBenefits: boolean;
    inactiveFilter: string;
}

export const defaultFilters: FilterValues = {
    investmentAreaId: '',
    projectTypeId: '',
    developmentStageId: '',
    status: '',
    programAdminId: '',
    investmentPeriodId: '',
    cpucProceedingId: '',
    businessClassId: '',
    utilityServiceId: '',
    assemblyDistrictId: '',
    senateDistrictId: '',
    contractMin: '',
    contractMax: '',
    disadvantaged: false,
    lowIncome: false,
    communityBenefits: false,
    inactiveFilter: '',
};

export function countActiveFilters(f: FilterValues): number {
    return Object.entries(f).filter(([, v]) =>
        typeof v === 'boolean' ? v : typeof v === 'string' && v !== ''
    ).length;
}

export function filtersToParams(f: FilterValues): Record<string, string> {
    const p: Record<string, string> = {};
    if (f.investmentAreaId) p.investmentAreaId = f.investmentAreaId;
    if (f.projectTypeId) p.projectTypeId = f.projectTypeId;
    if (f.developmentStageId) p.developmentStageId = f.developmentStageId;
    if (f.status) p.status = f.status;
    if (f.programAdminId) p.programAdminId = f.programAdminId;
    if (f.investmentPeriodId) p.investmentPeriodId = f.investmentPeriodId;
    if (f.cpucProceedingId) p.cpucProceedingId = f.cpucProceedingId;
    if (f.businessClassId) p.businessClassId = f.businessClassId;
    if (f.utilityServiceId) p.utilityServiceId = f.utilityServiceId;
    if (f.assemblyDistrictId) p.assemblyDistrictId = f.assemblyDistrictId;
    if (f.senateDistrictId) p.senateDistrictId = f.senateDistrictId;
    if (f.contractMin) p.contractMin = f.contractMin;
    if (f.contractMax) p.contractMax = f.contractMax;
    if (f.disadvantaged) p.disadvantaged = '1';
    if (f.lowIncome) p.lowIncome = '1';
    if (f.communityBenefits) p.communityBenefits = '1';
    if (f.inactiveFilter) p.inactiveFilter = f.inactiveFilter;
    return p;
}

export function getActiveFilterLabels(
    f: FilterValues,
    lookups: LookupData | null
): { key: keyof FilterValues; label: string; value: string }[] {
    const items: { key: keyof FilterValues; label: string; value: string }[] = [];
    const findName = (list: LookupOption[] | undefined, id: string) =>
        list?.find((o) => String(o.id) === id)?.name ?? id;
    if (f.investmentAreaId) items.push({ key: 'investmentAreaId', label: 'Investment Area', value: findName(lookups?.investmentAreas, f.investmentAreaId) });
    if (f.projectTypeId) items.push({ key: 'projectTypeId', label: 'Project Type', value: findName(lookups?.projectTypes, f.projectTypeId) });
    if (f.developmentStageId) items.push({ key: 'developmentStageId', label: 'Development Stage', value: findName(lookups?.developmentStages, f.developmentStageId) });
    if (f.status) items.push({ key: 'status', label: 'Status', value: f.status });
    if (f.programAdminId) items.push({ key: 'programAdminId', label: 'Program Admin', value: findName(lookups?.programAdmins, f.programAdminId) });
    if (f.investmentPeriodId) items.push({ key: 'investmentPeriodId', label: 'Investment Period', value: findName(lookups?.investmentProgramPeriods, f.investmentPeriodId) });
    if (f.cpucProceedingId) items.push({ key: 'cpucProceedingId', label: 'CPUC Proceeding', value: findName(lookups?.cpucProceedings, f.cpucProceedingId) });
    if (f.businessClassId) items.push({ key: 'businessClassId', label: 'Business Class', value: findName(lookups?.businessClassifications, f.businessClassId) });
    if (f.utilityServiceId) items.push({ key: 'utilityServiceId', label: 'Utility Service', value: findName(lookups?.utilityServiceAreas, f.utilityServiceId) });
    if (f.assemblyDistrictId) items.push({ key: 'assemblyDistrictId', label: 'Assembly District', value: findName(lookups?.assemblyDistricts, f.assemblyDistrictId) });
    if (f.senateDistrictId) items.push({ key: 'senateDistrictId', label: 'Senate District', value: findName(lookups?.senateDistricts, f.senateDistrictId) });
    if (f.contractMin) items.push({ key: 'contractMin', label: 'Min Contract', value: f.contractMin });
    if (f.contractMax) items.push({ key: 'contractMax', label: 'Max Contract', value: f.contractMax });
    if (f.disadvantaged) items.push({ key: 'disadvantaged', label: 'Disadvantaged', value: 'Yes' });
    if (f.lowIncome) items.push({ key: 'lowIncome', label: 'Low Income', value: 'Yes' });
    if (f.communityBenefits) items.push({ key: 'communityBenefits', label: 'Community Benefits', value: 'Yes' });
    return items;
}

interface ProjectFiltersProps {
    filters: FilterValues;
    onFiltersChange: (filters: FilterValues) => void;
    canViewInactive?: boolean;
}

export function ProjectFilters({ filters, onFiltersChange, canViewInactive = false }: ProjectFiltersProps) {
    const [open, setOpen] = useState(false);
    const [lookups, setLookups] = useState<LookupData | null>(null);
    const [loadingLookups, setLoadingLookups] = useState(true);

    const [showFunding, setShowFunding] = useState(false);
    const [showLocation, setShowLocation] = useState(false);

    const activeCount = countActiveFilters(filters);

    useEffect(() => {
        if (!open || lookups) return;
        fetch('/api/projectsList/lookups')
            .then((r) => r.json())
            .then((data) => { if (!data.error) setLookups(data); })
            .catch(console.error)
            .finally(() => setLoadingLookups(false));
    }, [open, lookups]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const update = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const handleReset = () => {
        onFiltersChange(defaultFilters);
    };

    const sel =
        'w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-white text-slate-700 appearance-none cursor-pointer';
    const inp =
        'w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-white text-slate-700';

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 font-semibold transition-all ${
                    activeCount > 0
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-200'
                }`}
            >
                <SlidersHorizontal className="h-4 w-4" />
                {activeCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {activeCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 top-0 z-50 flex w-[85vw] max-w-sm flex-col overflow-hidden bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                                <button type="button" onClick={() => setOpen(false)} className="text-slate-600 transition-colors hover:text-slate-900">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 pb-24">
                                {loadingLookups ? (
                                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading filters...
                                    </div>
                                ) : !lookups ? (
                                    <div className="py-16 text-center text-sm text-slate-400">Failed to load filters.</div>
                                ) : (
                                    <div className="space-y-5">
                                        {canViewInactive && (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                                <p className="mb-2 text-xs font-semibold text-amber-900">Visibility</p>
                                                <div className="flex rounded-lg border border-amber-200 bg-white overflow-hidden text-xs font-medium">
                                                    {([
                                                        { value: '',              label: 'Published' },
                                                        { value: 'all',           label: 'All' },
                                                        { value: 'inactive_only', label: 'Unpublished' },
                                                    ] as { value: string; label: string }[]).map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => onFiltersChange({ ...filters, inactiveFilter: opt.value })}
                                                            className={[
                                                                'flex-1 py-2 px-1 transition-colors',
                                                                filters.inactiveFilter === opt.value
                                                                    ? 'bg-amber-500 text-white'
                                                                    : 'text-slate-600 hover:bg-amber-50',
                                                            ].join(' ')}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="mt-1.5 text-xs text-amber-700">
                                                    {filters.inactiveFilter === 'all'
                                                        ? 'Showing all projects including unpublished'
                                                        : filters.inactiveFilter === 'inactive_only'
                                                            ? 'Showing unpublished projects only'
                                                            : 'Showing published projects only'}
                                                </p>
                                            </div>
                                        )}
                                        <SelectField label="Investment Area" value={filters.investmentAreaId} onChange={(v) => update('investmentAreaId', v)} options={lookups.investmentAreas} className={sel} />
                                        <SelectField label="Project Type" value={filters.projectTypeId} onChange={(v) => update('projectTypeId', v)} options={lookups.projectTypes} className={sel} />
                                        <SelectField label="Development Stage" value={filters.developmentStageId} onChange={(v) => update('developmentStageId', v)} options={lookups.developmentStages} className={sel} />

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                                            <div className="relative">
                                                <select value={filters.status} onChange={(e) => update('status', e.target.value)} className={sel}>
                                                    <option value="">All</option>
                                                    {lookups.projectStatuses.map((s, i) => (
                                                        <option key={`status-${i}`} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </div>

                                        <SelectField label="Program Administrator" value={filters.programAdminId} onChange={(v) => update('programAdminId', v)} options={lookups.programAdmins} className={sel} />
                                        <SelectField label="Investment Period" value={filters.investmentPeriodId} onChange={(v) => update('investmentPeriodId', v)} options={lookups.investmentProgramPeriods} className={sel} />
                                        <SelectField label="CPUC Proceedings" value={filters.cpucProceedingId} onChange={(v) => update('cpucProceedingId', v)} options={lookups.cpucProceedings} className={sel} />
                                        <SelectField label="Business Classification" value={filters.businessClassId} onChange={(v) => update('businessClassId', v)} options={lookups.businessClassifications} className={sel} />

                                        <CollapsibleSection title="Funding" open={showFunding} onToggle={() => setShowFunding(!showFunding)}>
                                            <div className="space-y-4 pt-3">
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Contract Amount (Min)</label>
                                                    <input type="text" placeholder="$0" value={filters.contractMin} onChange={(e) => update('contractMin', e.target.value)} className={inp} />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Contract Amount (Max)</label>
                                                    <input type="text" placeholder="$10,000,000" value={filters.contractMax} onChange={(e) => update('contractMax', e.target.value)} className={inp} />
                                                </div>
                                            </div>
                                        </CollapsibleSection>

                                        <CollapsibleSection title="Location" open={showLocation} onToggle={() => setShowLocation(!showLocation)}>
                                            <div className="space-y-4 pt-3">
                                                <SelectField label="Utility Service Area" value={filters.utilityServiceId} onChange={(v) => update('utilityServiceId', v)} options={lookups.utilityServiceAreas} className={sel} />
                                                <SelectField label="Assembly District" value={filters.assemblyDistrictId} onChange={(v) => update('assemblyDistrictId', v)} options={lookups.assemblyDistricts} className={sel} />
                                                <SelectField label="Senate District" value={filters.senateDistrictId} onChange={(v) => update('senateDistrictId', v)} options={lookups.senateDistricts} className={sel} />
                                            </div>
                                        </CollapsibleSection>

                                        <div>
                                            <h4 className="mb-3 text-sm font-semibold text-slate-700">Attributes</h4>
                                            <div className="space-y-2.5">
                                                <Check label="Community Benefits" checked={filters.communityBenefits} onChange={(v) => update('communityBenefits', v)} />
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="mb-3 text-sm font-semibold text-slate-700">Community Focus</h4>
                                            <div className="space-y-2.5">
                                                <Check label="Disadvantaged Community" checked={filters.disadvantaged} onChange={(v) => update('disadvantaged', v)} />
                                                <Check label="Low Income Community" checked={filters.lowIncome} onChange={(v) => update('lowIncome', v)} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-200 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition-all hover:bg-slate-50"
                                >
                                    Reset
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

interface FilterPillsProps {
    filters: FilterValues;
    lookups: LookupData | null;
    onRemove: (key: keyof FilterValues) => void;
    onClearAll: () => void;
}

export function FilterPills({ filters, lookups, onRemove, onClearAll }: FilterPillsProps) {
    const [expanded, setExpanded] = useState(true);
    const items = getActiveFilterLabels(filters, lookups);

    if (items.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-slate-200"
        >
            <div
                onClick={() => setExpanded(!expanded)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-2 transition-colors hover:bg-slate-50/50"
            >
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-0.5 text-xs font-semibold text-white">
                        {items.length} {items.length === 1 ? 'Filter' : 'Filters'}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onClearAll(); }}
                            className="rounded-full p-0.5 transition-colors hover:bg-slate-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                </div>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                </motion.div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-t border-slate-100"
                    >
                        <div className="flex flex-wrap gap-2 px-4 py-2.5">
                            {items.map((item, i) => (
                                <motion.span
                                    key={item.key}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs"
                                >
                                    <span className="font-medium text-slate-600">{item.label}:</span>
                                    <span className="max-w-[120px] truncate text-slate-500">{item.value}</span>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(item.key)}
                                        className="ml-0.5 text-slate-400 transition-colors hover:text-slate-700"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SelectField({
                         label, value, onChange, options, className,
                     }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: LookupOption[];
    className: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
            <div className="relative">
                <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
                    <option value="">All</option>
                    {options.map((o, i) => (
                        <option key={`${o.id}-${i}`} value={o.id}>{o.name}</option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
}

function CollapsibleSection({
                                title, open, onToggle, children,
                            }: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
            >
                <span className="text-sm font-semibold text-slate-700">{title}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="group flex cursor-pointer items-center gap-3">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-700 focus:ring-slate-400"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
        </label>
    );
}

export type { LookupData };