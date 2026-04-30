'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    ChevronDown,
    SlidersHorizontal,
    X,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
    defaultFilters,
    filtersToParams,
} from '@/components/projects_page/projectsList/ProjectsList_Filters';
import type {
    FilterValues,
    LookupData,
} from '@/components/projects_page/projectsList/ProjectsList_Filters';

type IdName = { id: number | string; name: string };

function lookupName(list: IdName[] | undefined, id: string): string {
    if (!list) return id;
    const hit = list.find((item) => String(item.id) === id);
    return hit ? hit.name : id;
}

type ActiveFilter = {
    key: keyof FilterValues;
    label: string;
    value: string;
};

function buildActiveFilters(
    filters: FilterValues,
    lookups: LookupData | null,
): ActiveFilter[] {
    const out: ActiveFilter[] = [];

    if (filters.investmentAreaId)
        out.push({
            key: 'investmentAreaId',
            label: 'Investment Area',
            value: lookupName(lookups?.investmentAreas, filters.investmentAreaId),
        });
    if (filters.projectTypeId)
        out.push({
            key: 'projectTypeId',
            label: 'Project Type',
            value: lookupName(lookups?.projectTypes, filters.projectTypeId),
        });
    if (filters.developmentStageId)
        out.push({
            key: 'developmentStageId',
            label: 'Development Stage',
            value: lookupName(lookups?.developmentStages, filters.developmentStageId),
        });
    if (filters.status)
        out.push({ key: 'status', label: 'Status', value: filters.status });
    if (filters.programAdminId)
        out.push({
            key: 'programAdminId',
            label: 'Program Admin',
            value: lookupName(lookups?.programAdmins, filters.programAdminId),
        });
    if (filters.investmentPeriodId)
        out.push({
            key: 'investmentPeriodId',
            label: 'Investment Period',
            value: lookupName(
                lookups?.investmentProgramPeriods,
                filters.investmentPeriodId,
            ),
        });
    if (filters.cpucProceedingId)
        out.push({
            key: 'cpucProceedingId',
            label: 'CPUC Proceeding',
            value: lookupName(lookups?.cpucProceedings, filters.cpucProceedingId),
        });
    if (filters.businessClassId)
        out.push({
            key: 'businessClassId',
            label: 'Business Class',
            value: lookupName(
                lookups?.businessClassifications,
                filters.businessClassId,
            ),
        });
    if (filters.utilityServiceId)
        out.push({
            key: 'utilityServiceId',
            label: 'Utility Service',
            value: lookupName(
                lookups?.utilityServiceAreas,
                filters.utilityServiceId,
            ),
        });
    if (filters.assemblyDistrictId)
        out.push({
            key: 'assemblyDistrictId',
            label: 'Assembly District',
            value: filters.assemblyDistrictId,
        });
    if (filters.senateDistrictId)
        out.push({
            key: 'senateDistrictId',
            label: 'Senate District',
            value: filters.senateDistrictId,
        });
    if (filters.contractMin)
        out.push({ key: 'contractMin', label: 'Min Contract', value: filters.contractMin });
    if (filters.contractMax)
        out.push({ key: 'contractMax', label: 'Max Contract', value: filters.contractMax });
    if (filters.disadvantaged)
        out.push({ key: 'disadvantaged', label: 'Disadvantaged', value: 'Yes' });
    if (filters.lowIncome)
        out.push({ key: 'lowIncome', label: 'Low Income', value: 'Yes' });
    if (filters.communityBenefits)
        out.push({ key: 'communityBenefits', label: 'Community Benefits', value: 'Yes' });

    return out;
}

type SuggestionProject = {
    id: string | number;
    code: string;
    name: string;
    location?: string;
    organizationShort?: string;
};

const SUGGESTION_LIMIT = 8;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

function buildSuggestionParams(search: string, filters: FilterValues): URLSearchParams {
    const params = new URLSearchParams({
        page: '1',
        limit: String(SUGGESTION_LIMIT),
        search: search.trim(),
    });

    const fp = filtersToParams(filters);
    for (const [key, value] of Object.entries(fp)) params.set(key, value);

    return params;
}

function setBodyScrollLocked(locked: boolean) {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = locked ? 'hidden' : 'unset';
}

export function SearchAndFilter_Home() {
    const router = useRouter();

    const [showFilters, setShowFilters] = useState(false);
    const [showAppliedFilters, setShowAppliedFilters] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [filters, setFilters] = useState<FilterValues>(defaultFilters);
    const [lookups, setLookups] = useState<LookupData | null>(null);

    const [suggestions, setSuggestions] = useState<SuggestionProject[]>([]);
    const [totalMatches, setTotalMatches] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const searchWrapperRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        let cancelled = false;

        fetch('/api/home/lookups')
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled && !data.error) setLookups(data);
            })
            .catch(console.error);

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const trimmed = searchKeyword.trim();

        if (trimmed.length < MIN_QUERY_LENGTH) {
            return;
        }

        const myId = ++requestIdRef.current;

        const timer = setTimeout(() => {
            setIsSearching(true);

            fetch(`/api/projectsList?${buildSuggestionParams(trimmed, filters)}`)
                .then((r) => r.json())
                .then((data) => {
                    if (myId !== requestIdRef.current) return;

                    if (data.projects && Array.isArray(data.projects)) {
                        setSuggestions(data.projects.slice(0, SUGGESTION_LIMIT));
                        setTotalMatches(data.total ?? 0);
                    } else {
                        setSuggestions([]);
                        setTotalMatches(0);
                    }

                    setHighlightedIndex(-1);
                })
                .catch((err) => {
                    if (myId !== requestIdRef.current) return;

                    console.error('Project suggestion fetch failed:', err);
                    setSuggestions([]);
                    setTotalMatches(0);
                    setHighlightedIndex(-1);
                })
                .finally(() => {
                    if (myId === requestIdRef.current) {
                        setIsSearching(false);
                    }
                });
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchKeyword, filters]);

    useEffect(() => {
        if (!isDropdownOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchWrapperRef.current &&
                !searchWrapperRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    useEffect(() => {
        return () => {
            setBodyScrollLocked(false);
        };
    }, []);

    const activeFilters = useMemo(
        () => buildActiveFilters(filters, lookups),
        [filters, lookups],
    );

    const filterCount = activeFilters.length + (searchKeyword ? 1 : 0);
    const hasActiveFilters = filterCount > 0;

    const trimmedKeyword = searchKeyword.trim();
    const showDropdown =
        isDropdownOpen &&
        !showFilters &&
        trimmedKeyword.length >= MIN_QUERY_LENGTH;
    const hasMoreResults = totalMatches > suggestions.length;

    const buildListQueryString = (): string => {
        const params = new URLSearchParams();
        if (trimmedKeyword) params.set('search', trimmedKeyword);
        const fp = filtersToParams(filters);
        for (const [key, value] of Object.entries(fp)) params.set(key, value);
        return params.toString();
    };

    const goToProjectDetail = (project: SuggestionProject) => {
        const qs = buildListQueryString();
        const url = qs
            ? `/projects/${project.id}?${qs}`
            : `/projects/${project.id}`;

        setIsDropdownOpen(false);
        router.push(url);
    };

    const goToProjectsList = () => {
        const qs = buildListQueryString();
        setIsDropdownOpen(false);
        router.push(qs ? `/projects?${qs}` : '/projects');
    };

    const openFilterPanel = () => {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        setShowFilters(true);
        setBodyScrollLocked(true);
    };

    const closeFilterPanel = () => {
        setShowFilters(false);
        setBodyScrollLocked(false);
    };

    const toggleFilterPanel = () => {
        if (showFilters) closeFilterPanel();
        else openFilterPanel();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) {
            if (e.key === 'Enter') {
                e.preventDefault();
                goToProjectsList();
            }
            return;
        }

        const totalRows = suggestions.length + (hasMoreResults ? 1 : 0);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < totalRows - 1 ? prev + 1 : 0,
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev <= 0 ? totalRows - 1 : prev - 1,
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                    goToProjectDetail(suggestions[highlightedIndex]);
                } else {
                    goToProjectsList();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const updateFilter = <K extends keyof FilterValues>(
        key: K,
        value: FilterValues[K],
    ) => setFilters((prev) => ({ ...prev, [key]: value }));

    const handleReset = () => {
        setSearchKeyword('');
        setFilters(defaultFilters);
        setIsDropdownOpen(false);
    };

    const handleRemoveFilter = (filter: ActiveFilter) => {
        const key = filter.key;
        setFilters((prev) => ({
            ...prev,
            [key]: typeof prev[key] === 'boolean' ? false : '',
        }));
    };

    const handleRemoveSearch = () => {
        setSearchKeyword('');
        setIsDropdownOpen(false);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        goToProjectsList();
    };

    return (
        <div className="mx-auto w-full max-w-6xl">
            <AnimatePresence mode="wait">
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeFilterPanel}
                            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 top-0 z-50 w-[85vw] max-w-sm overflow-y-auto bg-white shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                                <h3 className="text-lg font-bold text-slate-900">Filters</h3>

                                <motion.button
                                    type="button"
                                    onClick={closeFilterPanel}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-slate-600 transition-colors hover:text-slate-900"
                                >
                                    <X className="h-6 w-6" />
                                </motion.button>
                            </div>

                            <div className="p-6 pb-24">
                                <div className="space-y-5">
                                    <FilterSelect
                                        label="Investment Area"
                                        value={filters.investmentAreaId}
                                        onChange={(v) => updateFilter('investmentAreaId', v)}
                                        options={lookups?.investmentAreas ?? []}
                                    />

                                    <FilterSelect
                                        label="Project Type"
                                        value={filters.projectTypeId}
                                        onChange={(v) => updateFilter('projectTypeId', v)}
                                        options={lookups?.projectTypes ?? []}
                                    />

                                    <FilterSelect
                                        label="Development Stage"
                                        value={filters.developmentStageId}
                                        onChange={(v) => updateFilter('developmentStageId', v)}
                                        options={lookups?.developmentStages ?? []}
                                    />

                                    <FilterSelect
                                        label="Status"
                                        value={filters.status}
                                        onChange={(v) => updateFilter('status', v)}
                                        options={
                                            lookups?.projectStatuses?.map((name) => ({
                                                id: name,
                                                name,
                                            })) ?? []
                                        }
                                    />

                                    <FilterSelect
                                        label="Program Administrator"
                                        value={filters.programAdminId}
                                        onChange={(v) => updateFilter('programAdminId', v)}
                                        options={lookups?.programAdmins ?? []}
                                    />

                                    <FilterSelect
                                        label="Investment Period"
                                        value={filters.investmentPeriodId}
                                        onChange={(v) => updateFilter('investmentPeriodId', v)}
                                        options={lookups?.investmentProgramPeriods ?? []}
                                    />

                                    <FilterSelect
                                        label="CPUC Proceeding"
                                        value={filters.cpucProceedingId}
                                        onChange={(v) => updateFilter('cpucProceedingId', v)}
                                        options={lookups?.cpucProceedings ?? []}
                                    />

                                    <FilterSelect
                                        label="Business Classification"
                                        value={filters.businessClassId}
                                        onChange={(v) => updateFilter('businessClassId', v)}
                                        options={lookups?.businessClassifications ?? []}
                                    />

                                    <SectionToggle label="Funding" />
                                    <TextInput
                                        label="Contract Amount (Min)"
                                        placeholder="$0"
                                        value={filters.contractMin}
                                        onChange={(v) => updateFilter('contractMin', v)}
                                    />
                                    <TextInput
                                        label="Contract Amount (Max)"
                                        placeholder="$10,000,000"
                                        value={filters.contractMax}
                                        onChange={(v) => updateFilter('contractMax', v)}
                                    />

                                    <SectionToggle label="Location" />
                                    <FilterSelect
                                        label="Utility Service Area"
                                        value={filters.utilityServiceId}
                                        onChange={(v) => updateFilter('utilityServiceId', v)}
                                        options={lookups?.utilityServiceAreas ?? []}
                                    />
                                    <FilterSelect
                                        label="Assembly District"
                                        value={filters.assemblyDistrictId}
                                        onChange={(v) => updateFilter('assemblyDistrictId', v)}
                                        options={lookups?.assemblyDistricts ?? []}
                                    />
                                    <FilterSelect
                                        label="Senate District"
                                        value={filters.senateDistrictId}
                                        onChange={(v) => updateFilter('senateDistrictId', v)}
                                        options={lookups?.senateDistricts ?? []}
                                    />

                                    <CheckboxGroup
                                        title="Community Focus"
                                        items={[
                                            {
                                                label: 'Disadvantaged',
                                                checked: filters.disadvantaged,
                                                onChange: (v) => updateFilter('disadvantaged', v),
                                            },
                                            {
                                                label: 'Low Income',
                                                checked: filters.lowIncome,
                                                onChange: (v) => updateFilter('lowIncome', v),
                                            },
                                            {
                                                label: 'Community Benefits',
                                                checked: filters.communityBenefits,
                                                onChange: (v) => updateFilter('communityBenefits', v),
                                            },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4">
                                <motion.button
                                    type="button"
                                    onClick={handleReset}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition-all hover:bg-slate-50"
                                >
                                    Reset
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
                <div ref={searchWrapperRef}>
                    <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 p-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search projects..."
                                    className="w-full border-0 bg-transparent py-3 pl-12 pr-10 text-lg text-slate-700 focus:outline-none"
                                    value={searchKeyword}
                                    onChange={(e) => {
                                        setSearchKeyword(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => {
                                        if (trimmedKeyword.length >= MIN_QUERY_LENGTH) {
                                            setIsDropdownOpen(true);
                                        }
                                    }}
                                    onKeyDown={handleInputKeyDown}
                                    role="combobox"
                                    aria-expanded={showDropdown}
                                    aria-controls="search-suggestions-listbox"
                                    aria-autocomplete="list"
                                    aria-activedescendant={
                                        highlightedIndex >= 0
                                            ? `search-suggestion-${highlightedIndex}`
                                            : undefined
                                    }
                                />

                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                                )}
                            </div>

                            <motion.button
                                type="button"
                                onClick={toggleFilterPanel}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all ${
                                    showFilters ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
                                }`}
                                aria-label="Toggle filters"
                            >
                                <SlidersHorizontal className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>

                    <AnimatePresence initial={false}>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
                                id="search-suggestions-listbox"
                                role="listbox"
                            >
                                {isSearching && suggestions.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                                        Searching…
                                    </div>
                                ) : suggestions.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                                        No projects match &quot;{trimmedKeyword}&quot;
                                    </div>
                                ) : (
                                    <>
                                        <ul className="max-h-[60vh] overflow-y-auto py-1">
                                            {suggestions.map((project, index) => {
                                                const isHighlighted =
                                                    index === highlightedIndex;

                                                return (
                                                    <li
                                                        key={`${project.id}-${index}`}
                                                        id={`search-suggestion-${index}`}
                                                        role="option"
                                                        aria-selected={isHighlighted}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                goToProjectDetail(project)
                                                            }
                                                            onMouseEnter={() =>
                                                                setHighlightedIndex(index)
                                                            }
                                                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                                                isHighlighted
                                                                    ? 'bg-slate-100'
                                                                    : 'hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <div className="flex min-w-0 flex-1 flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="truncate text-sm font-semibold text-slate-900">
                                                                        {project.name}
                                                                    </span>
                                                                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                                                        {project.code}
                                                                    </span>
                                                                </div>
                                                                {(project.organizationShort ||
                                                                    project.location) && (
                                                                    <span className="mt-0.5 truncate text-xs text-slate-500">
                                                                        {[
                                                                            project.organizationShort,
                                                                            project.location,
                                                                        ]
                                                                            .filter(Boolean)
                                                                            .join(' • ')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        {hasMoreResults && (
                                            <button
                                                type="button"
                                                onClick={goToProjectsList}
                                                onMouseEnter={() =>
                                                    setHighlightedIndex(suggestions.length)
                                                }
                                                className={`flex w-full items-center justify-between border-t border-slate-200 px-4 py-3 text-sm font-semibold transition-colors ${
                                                    highlightedIndex === suggestions.length
                                                        ? 'bg-slate-100 text-slate-900'
                                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                }`}
                                            >
                                                <span>
                                                    See all {totalMatches.toLocaleString()} results
                                                </span>
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>

            <AnimatePresence>
                {hasActiveFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between p-4 hover:bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => setShowAppliedFilters((prev) => !prev)}
                                className="flex flex-1 items-center justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1 text-sm font-semibold text-white">
                                        {filterCount} {filterCount === 1 ? 'Filter' : 'Filters'}
                                    </span>
                                </span>

                                <motion.div
                                    animate={{ rotate: showAppliedFilters ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="h-5 w-5 text-slate-600" />
                                </motion.div>
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="ml-3 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Clear all filters"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showAppliedFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-slate-200/60"
                                >
                                    <div className="space-y-3 p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {searchKeyword && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5"
                                                >
                                                    <span className="text-sm font-medium text-slate-700">Search:</span>
                                                    <span className="text-sm text-slate-600">{searchKeyword}</span>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveSearch}
                                                        className="ml-2 text-slate-500 hover:text-slate-700"
                                                        aria-label="Remove search filter"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </motion.div>
                                            )}

                                            {activeFilters.map((filter, index) => (
                                                <motion.div
                                                    key={`${filter.key}-${index}`}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5"
                                                >
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {filter.label}:
                                                    </span>
                                                    <span className="text-sm text-slate-600">{filter.value}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFilter(filter)}
                                                        className="ml-2 text-slate-500 hover:text-slate-700"
                                                        aria-label={`Remove ${filter.label} filter`}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <motion.button
                                            type="button"
                                            onClick={goToProjectsList}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="w-full rounded-lg bg-slate-700 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-slate-800"
                                        >
                                            Submit
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

type FilterSelectProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: IdName[];
};

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
    const uniqueOptions = useMemo(() => {
        const seen = new Set<string>();
        return options.filter((opt) => {
            const key = String(opt.id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [options]);

    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
            <div className="relative">
                <select
                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">Select...</option>
                    {uniqueOptions.map((option, index) => (
                        <option
                            key={`${String(option.id)}-${index}`}
                            value={String(option.id)}
                        >
                            {option.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
}

type TextInputProps = {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
};

function TextInput({ label, placeholder, value, onChange }: TextInputProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function SectionToggle({ label }: { label: string }) {
    return (
        <div>
            <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
            >
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
        </div>
    );
}

type CheckboxGroupItem = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

type CheckboxGroupProps = {
    title: string;
    items: CheckboxGroupItem[];
};

function CheckboxGroup({ title, items }: CheckboxGroupProps) {
    return (
        <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-700">{title}</h4>
            <div className="space-y-2.5">
                {items.map((item) => (
                    <label key={item.label} className="group flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                            checked={item.checked}
                            onChange={(e) => item.onChange(e.target.checked)}
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900">{item.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}