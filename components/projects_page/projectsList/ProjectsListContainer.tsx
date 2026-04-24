// ─── components/projects_page/projectsList/ProjectsListContainer.tsx ───
// Data-fetching container: owns search, filters, pagination, export.
// Syncs filter + search state to URL for shareable links.
// Renders filter pills between toolbar and project list.

'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, EyeOff } from 'lucide-react';
import { ProjectsList } from './ProjectsList';
import {
    ProjectFilters,
    FilterPills,
    defaultFilters,
    filtersToParams,
} from './ProjectsList_Filters';
import { ProjectExport } from './ProjectsList_Export';
import type { FilterValues, LookupData } from './ProjectsList_Filters';
import type { Project } from './ProjectsList';

const ITEMS_PER_PAGE = 100;

// ── Filter keys for URL sync ─────────────────────────────────────────
const FILTER_PARAM_KEYS: (keyof FilterValues)[] = [
    'investmentAreaId', 'projectTypeId', 'developmentStageId', 'status',
    'programAdminId', 'investmentPeriodId', 'cpucProceedingId',
    'businessClassId', 'utilityServiceId', 'assemblyDistrictId',
    'senateDistrictId', 'contractMin', 'contractMax',
    'disadvantaged', 'lowIncome', 'communityBenefits', 'inactiveFilter',
];

function filtersFromUrl(sp: URLSearchParams): FilterValues {
    const f = { ...defaultFilters };
    for (const key of FILTER_PARAM_KEYS) {
        const val = sp.get(key);
        if (val !== null) {
            if (typeof f[key] === 'boolean') {
                (f as Record<string, unknown>)[key] = val === '1' || val === 'true';
            } else {
                (f as Record<string, unknown>)[key] = val;
            }
        }
    }
    return f;
}

function buildApiParams(page: number, search: string, filters: FilterValues, inactiveScopeAdminId?: string | null): URLSearchParams {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
    });
    if (search.trim()) params.set('search', search.trim());
    const fp = filtersToParams(filters);
    for (const [key, value] of Object.entries(fp)) params.set(key, value);
    // Scope inactive results to a specific program admin org (ProgramAdmin role)
    if (filters.inactiveFilter && inactiveScopeAdminId) {
        params.set('inactiveScope', inactiveScopeAdminId);
    }
    return params;
}

// ─── Props ───────────────────────────────────────────────────────────
interface ProjectsListContainerProps {
    categoryFilter?: string | null;
    onClearFilter?: () => void;
    searchTerm?: string;
    onSearchTermChange?: (term: string) => void;
}

export function ProjectsListContainer({
                                          categoryFilter,
                                          onClearFilter,
                                          searchTerm = '',
                                          onSearchTermChange,
                                      }: ProjectsListContainerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    // Admin visibility
    const userGroups: string[] = (session?.user as { groups?: string[] })?.groups ?? [];
    const userOrg: string | null = (session?.user as { organization?: string | null })?.organization ?? null;
    const isMasterAdmin = userGroups.includes('MasterAdmin');
    const isProgramAdmin = userGroups.includes('ProgramAdmin');
    const canViewInactive = isMasterAdmin || isProgramAdmin;

    const inactiveScopeAdminId: string | null = isProgramAdmin && !isMasterAdmin ? (userOrg ?? null) : null;

    // Hydrate from URL
    const [filters, setFilters] = useState<FilterValues>(() => filtersFromUrl(searchParams));
    const [inputValue, setInputValue] = useState(searchParams.get('search') ?? searchTerm);
    const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') ?? searchTerm);

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Cached lookups for pill labels
    const [lookups, setLookups] = useState<LookupData | null>(null);

    const isInitialMount = useRef(true);
    const prevSearchTerm = useRef(searchTerm);
    const onSearchTermChangeRef = useRef(onSearchTermChange);
    onSearchTermChangeRef.current = onSearchTermChange;

    // Fetch lookups once (for filter pill display names)
    useEffect(() => {
        if (lookups) return;
        fetch('/api/projectsList/lookups')
            .then((r) => r.json())
            .then((data) => { if (!data.error) setLookups(data); })
            .catch(console.error);
    }, [lookups]);

    // Sync external searchTerm prop → local input (only on external change)
    if (searchTerm !== prevSearchTerm.current) {
        prevSearchTerm.current = searchTerm;
        setInputValue(searchTerm);
    }

    // Debounced search — also notifies parent via ref callback (avoids setState-in-effect)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchKeyword(inputValue);
            onSearchTermChangeRef.current?.(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    // Sync state → URL (skip first render)
    useEffect(() => {
        if (isInitialMount.current) { isInitialMount.current = false; return; }
        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        for (const key of FILTER_PARAM_KEYS) params.delete(key);
        if (searchKeyword.trim()) params.set('search', searchKeyword.trim());
        const fp = filtersToParams(filters);
        for (const [key, value] of Object.entries(fp)) params.set(key, value);
        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [searchKeyword, filters]);

    // Fetch projects
    const fetchProjects = useCallback((page: number, search: string, f: FilterValues) => {
        setLoading(true);
        fetch(`/api/projectsList?${buildApiParams(page, search, f, inactiveScopeAdminId)}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.projects && Array.isArray(data.projects)) {
                    setProjects(data.projects);
                    setTotalPages(data.totalPages ?? 1);
                    setTotalCount(data.total ?? 0);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchProjects(currentPage, searchKeyword, filters);
    }, [currentPage, searchKeyword, filters, fetchProjects]);

    useEffect(() => { setCurrentPage(1); }, [searchKeyword, categoryFilter, filters]);

    const buildFilterParams = useCallback(
        () => buildApiParams(1, searchKeyword, filters, inactiveScopeAdminId),
        [searchKeyword, filters, inactiveScopeAdminId]
    );

    // Remove a single filter
    const handleRemoveFilter = (key: keyof FilterValues) => {
        setFilters((prev) => ({
            ...prev,
            [key]: typeof prev[key] === 'boolean' ? false : '',
        }));
    };

    // ── Toolbar ──
    const toolbar = (
        <>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search all projects..."
                    className="w-full border-0 bg-transparent py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>

            <ProjectFilters filters={filters} onFiltersChange={setFilters} canViewInactive={canViewInactive} />
            <ProjectExport buildFilterParams={buildFilterParams} />
        </>
    );

    // ── Filter pills ──
    const filterPills = (
        <FilterPills
            filters={filters}
            lookups={lookups}
            onRemove={handleRemoveFilter}
            onClearAll={() => setFilters(defaultFilters)}
        />
    );

    const inactiveBanner = filters.inactiveFilter ? (
        <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <EyeOff className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
                {filters.inactiveFilter === 'all'
                    ? <><strong>All projects</strong> — including unpublished. {inactiveScopeAdminId ? 'Scoped to your organization.' : ''}</>
                    : <><strong>Unpublished projects only</strong> — hidden from the public. {inactiveScopeAdminId ? 'Scoped to your organization.' : ''}</>
                }
            </span>
        </div>
    ) : null;

    return (
        <>
            {inactiveBanner}
            <ProjectsList
                projects={projects}
                loading={loading}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                categoryFilter={categoryFilter}
                onClearFilter={onClearFilter}
                toolbar={toolbar}
                filterPills={filterPills}
                userOrganization={session?.user?.organization ?? null}
            />
        </>
    );
}