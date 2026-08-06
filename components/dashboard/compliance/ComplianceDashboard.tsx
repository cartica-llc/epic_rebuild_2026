'use client';

import React from 'react';
import {
    ChevronDown,
    ChevronRight,
    Download,
    Filter,
    Search,
    SquareArrowOutUpRight,
    X,
} from 'lucide-react';

import { ActiveFilterSummary } from './ActiveFilterSummary';
import { CompletenessFieldSummary } from './CompletenessFieldSummary';
import { ComprehensivenessSummary } from './ComprehensivenessSummary';
import { exportComplianceToExcel } from './exportExcel';
import { PROJECTS_PER_PAGE } from './fieldRequirements';
import { FlagFilterMenu, type FlagFilterValue } from './FlagFilterMenu';
import { enrichProject, isOutOfCompliance } from './helpers';
import { Pagination } from './Pagination';
import { ProjectDrillDown } from './ProjectDrillDown';
import type { ComplianceProject, EnrichedProject } from './types';
import {
    ComplianceBar,
    FilterSelect,
    FlagChips,
    LEVEL_DOT,
    Section,
    StatCard,
    StatusPill,
} from './uiPrimitives';

export interface ComplianceDashboardProps {
    projects: ComplianceProject[];
    today?: Date;
}

function projectEditHref(projectId: number): string {
    return `/projects/${projectId}/edit`;
}

type ViewFilter = 'out-of-compliance' | 'compliant';

const VIEW_LABELS: Record<ViewFilter, string> = {
    'out-of-compliance': 'Out of compliance',
    compliant: 'Compliant',
};

export function ComplianceDashboard({ projects, today }: ComplianceDashboardProps) {
    const [todayRef] = React.useState<Date>(() => today ?? new Date());

    const [statusFilter, setStatusFilter] = React.useState('All');
    const [periodFilter, setPeriodFilter] = React.useState('All');
    const [adminFilter, setAdminFilter] = React.useState('All');

    const [flagFilter, setFlagFilter] = React.useState<FlagFilterValue>('All');

    const [viewFilter, setViewFilter] = React.useState<ViewFilter>('out-of-compliance');
    const [searchTerm, setSearchTerm] = React.useState('');

    const [expandedId, setExpandedId] = React.useState<number | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);

    const [filtersOpen, setFiltersOpen] = React.useState(false);

    const resetPagingState = () => {
        setCurrentPage(1);
        setExpandedId(null);
    };

    const handleStatusFilter = (v: string) => {
        setStatusFilter(v);
        resetPagingState();
    };
    const handlePeriodFilter = (v: string) => {
        setPeriodFilter(v);
        resetPagingState();
    };
    const handleAdminFilter = (v: string) => {
        setAdminFilter(v);
        resetPagingState();
    };
    const handleFlagFilter = (v: FlagFilterValue) => {
        setFlagFilter(v);
        resetPagingState();
    };
    const handleViewFilter = (v: ViewFilter) => {
        setViewFilter(v);
        resetPagingState();
    };
    const handleSearch = (v: string) => {
        setSearchTerm(v);
        resetPagingState();
    };

    const reset = () => {
        setStatusFilter('All');
        setPeriodFilter('All');
        setAdminFilter('All');
        setFlagFilter('All');
        setViewFilter('out-of-compliance');
        setSearchTerm('');
        resetPagingState();
    };

    const enriched: EnrichedProject[] = React.useMemo(
        () => projects.map((p) => enrichProject(p, todayRef)),
        [projects, todayRef],
    );

    const totals = React.useMemo(() => {
        const compliant = enriched.filter((p) => p.compliance.level === 'green').length;
        const flagged = enriched.filter((p) => p.flags.length > 0).length;
        const outOfCompliance = enriched.filter(isOutOfCompliance).length;

        const closedComplete = enriched.filter(
            (p) =>
                p.compliance.level === 'green' &&
                p.compliance.stageResults.some((s) => s.stage === 'End'),
        ).length;

        return { compliant, flagged, outOfCompliance, closedComplete, total: enriched.length };
    }, [enriched]);

    const baseSet = React.useMemo(() => {
        switch (viewFilter) {
            case 'compliant':
                return enriched.filter((p) => p.compliance.level === 'green');
            case 'out-of-compliance':
            default:
                return enriched.filter(isOutOfCompliance);
        }
    }, [enriched, viewFilter]);

    const filterOptions = React.useMemo(() => {
        const uniq = (vals: string[]) =>
            Array.from(new Set(vals.filter((v) => v && v.trim() !== ''))).sort((a, b) =>
                a.localeCompare(b),
            );

        return {
            statuses: uniq(enriched.map((p) => p.projectStatus)),
            periods: uniq(enriched.map((p) => p.epicPeriod)),
            admins: uniq(enriched.map((p) => p.programAdmin)),
        };
    }, [enriched]);

    const preFlagFiltered = React.useMemo(() => {
        return baseSet.filter((p) => {
            if (statusFilter !== 'All' && p.projectStatus !== statusFilter) return false;
            if (periodFilter !== 'All' && p.epicPeriod !== periodFilter) return false;
            if (adminFilter !== 'All' && p.programAdmin !== adminFilter) return false;

            if (searchTerm.trim()) {
                const q = searchTerm.trim().toLowerCase();
                if (
                    !p.projectName.toLowerCase().includes(q) &&
                    !p.projectNumber.toLowerCase().includes(q)
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [baseSet, statusFilter, periodFilter, adminFilter, searchTerm]);

    const filtered = React.useMemo(() => {
        if (flagFilter === 'All') return preFlagFiltered;
        return preFlagFiltered.filter(
            (p) => p.flags.some((f) => f.id === flagFilter) || p.consistencyFlags.some((f) => f.id === flagFilter),
        );
    }, [preFlagFiltered, flagFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PROJECTS_PER_PAGE));
    const paginated = filtered.slice(
        (currentPage - 1) * PROJECTS_PER_PAGE,
        currentPage * PROJECTS_PER_PAGE,
    );

    const hasActiveFilters =
        statusFilter !== 'All' ||
        periodFilter !== 'All' ||
        adminFilter !== 'All' ||
        flagFilter !== 'All' ||
        viewFilter !== 'out-of-compliance' ||
        searchTerm.trim() !== '';

    const [isExporting, setIsExporting] = React.useState(false);
    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {

            const set = filtered.length > 0 ? filtered : baseSet;
            await exportComplianceToExcel(set, todayRef);
        } catch (err) {
            console.error('Excel export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-5  py-12 px-6 max-w-7xl m-auto">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatCard
                    label="Out of Compliance"
                    value={totals.outOfCompliance.toString()}
                    sub="Need attention"
                    accent="red"
                    help="Projects missing required fields for their current status, or with operational alerts. This is the union of all projects that need follow-up. Click to filter."
                    onClick={() => handleViewFilter('out-of-compliance')}
                    active={viewFilter === 'out-of-compliance'}
                />
                <StatCard
                    label="Complete"
                    value={totals.compliant.toString()}
                    sub={
                        totals.closedComplete > 0
                            ? `${totals.closedComplete} fully closed out`
                            : `${totals.total > 0 ? Math.round((totals.compliant / totals.total) * 100) : 0}% of portfolio`
                    }
                    accent="green"
                    help="Projects with every required field filled for their applicable timing tiers. Includes closed-out projects with all Initial, Annual, and End fields complete. Click to filter."
                    onClick={() => handleViewFilter('compliant')}
                    active={viewFilter === 'compliant'}
                />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-[180px] flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search project name or number…"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-700 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setFiltersOpen((v) => !v)}
                        aria-expanded={filtersOpen}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            hasActiveFilters
                                ? 'border-indigo-200 bg-white text-indigo-600'
                                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filters
                        {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                        <ChevronDown className={`h-3 w-3 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={isExporting || enriched.length === 0}
                        title={isExporting ? 'Exporting…' : 'Export Excel'}
                        aria-label="Export Excel"
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Download className="h-3.5 w-3.5" />
                    </button>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={reset}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}

                    <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
                    </span>
                </div>

                {filtersOpen && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                        <FilterSelect
                            aria-label="Status"
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            options={[
                                { value: 'All', label: 'All Statuses' },
                                ...filterOptions.statuses.map((s) => ({ value: s, label: s })),
                            ]}
                        />
                        <FilterSelect
                            aria-label="EPIC Period"
                            value={periodFilter}
                            onChange={handlePeriodFilter}
                            options={[
                                { value: 'All', label: 'All Periods' },
                                ...filterOptions.periods.map((p) => ({ value: p, label: p })),
                            ]}
                        />
                        <FilterSelect
                            aria-label="Program Administrator"
                            value={adminFilter}
                            onChange={handleAdminFilter}
                            options={[
                                { value: 'All', label: 'All Admins' },
                                ...filterOptions.admins.map((a) => ({ value: a, label: a })),
                            ]}
                        />
                        <FlagFilterMenu value={flagFilter} onChange={handleFlagFilter} projects={preFlagFiltered} />
                    </div>
                )}
            </div>

            <ActiveFilterSummary
                count={filtered.length}
                statusFilter={statusFilter}
                adminFilter={adminFilter}
                periodFilter={periodFilter}
                flagFilter={flagFilter}
                searchTerm={searchTerm}
            />

            <Section padded={false}>
                {paginated.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        {baseSet.length === 0 ? (

                            viewFilter === 'out-of-compliance' ? (
                                <>
                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                        <span className="text-lg">✓</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">All projects compliant</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        No projects are out of compliance or flagged.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-slate-700">
                                        No {VIEW_LABELS[viewFilter].toLowerCase()} projects
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Try a different view from the cards above.
                                    </p>
                                </>
                            )
                        ) : (
                            <>
                                <p className="text-sm font-medium text-slate-700">No matches</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Try clearing filters or adjusting your search.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="hidden lg:block">

                            <table className="w-full table-fixed text-left text-xs">
                                <colgroup>
                                    <col className="w-8" />
                                    <col />
                                    <col className="w-24" />
                                    <col className="w-20" />
                                    <col className="w-44" />
                                    <col className="w-36" />
                                    <col className="w-8" />
                                </colgroup>
                                <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="py-3 pl-4" />
                                    <th className="py-3 pr-3">Project</th>
                                    <th className="py-3 pr-3">Status</th>
                                    <th className="py-3 pr-3">Period</th>
                                    <th className="py-3 pr-3">Fields</th>
                                    <th className="py-3 pr-3">Flags</th>
                                    <th className="py-3 pr-4" />
                                </tr>
                                </thead>
                                <tbody>
                                {paginated.map((p) => {
                                    const isExpanded = expandedId === p.projectId;
                                    return (
                                        <React.Fragment key={p.projectId}>
                                            <tr
                                                onClick={() =>
                                                    setExpandedId(isExpanded ? null : p.projectId)
                                                }
                                                className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                                            >
                                                <td className="py-3 pl-4">
                                                        <span
                                                            className={`inline-block h-2 w-2 rounded-full ${LEVEL_DOT[p.compliance.level]}`}
                                                            title={p.compliance.level === 'green' ? 'Compliant' : 'Incomplete'}
                                                        />
                                                </td>

                                                <td className="py-3 pr-3">
                                                    <a
                                                        href={projectEditHref(p.projectId)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title={p.projectName}
                                                        className="group flex min-w-0 items-center gap-3"
                                                    >
                                                        <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-500 group-hover:text-indigo-600">
                                                            {p.projectNumber}
                                                        </span>
                                                        <span className="min-w-0 flex-1 truncate font-medium text-slate-800 underline decoration-transparent underline-offset-2 group-hover:text-indigo-700 group-hover:decoration-indigo-400">
                                                            {p.projectName}
                                                        </span>
                                                        <SquareArrowOutUpRight className="h-3 w-3 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-indigo-500" />
                                                    </a>
                                                </td>

                                                <td className="py-3 pr-3">
                                                    <StatusPill status={p.projectStatus} />
                                                </td>

                                                <td className="py-3 pr-3 text-[11px] text-slate-500">
                                                    {p.epicPeriod || '—'}
                                                </td>

                                                <td className="py-3 pr-3">
                                                    <div className="w-32">
                                                        <ComplianceBar
                                                            filled={p.compliance.filledTotal}
                                                            total={p.compliance.requiredTotal}
                                                            level={p.compliance.level}
                                                        />
                                                    </div>
                                                </td>

                                                <td className="py-3 pr-3">
                                                    <FlagChips flags={p.flags} consistencyFlags={p.consistencyFlags} />
                                                </td>

                                                <td className="py-3 pr-4 text-slate-400">
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={7} className="border-l-2 border-l-indigo-300 bg-slate-50 px-6 py-4">
                                                        <ProjectDrillDown project={p} today={todayRef} />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 lg:hidden">
                            {paginated.map((p) => {
                                const isExpanded = expandedId === p.projectId;
                                return (
                                    <div key={p.projectId}>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setExpandedId(isExpanded ? null : p.projectId)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setExpandedId(isExpanded ? null : p.projectId);
                                                }
                                            }}
                                            className="flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50"
                                        >
                                            <span
                                                className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT[p.compliance.level]}`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <a
                                                        href={projectEditHref(p.projectId)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="group inline-flex items-center gap-1 font-mono text-[11px] tabular-nums text-slate-500 hover:text-indigo-600"
                                                    >
                                                        {p.projectNumber}
                                                        <SquareArrowOutUpRight className="h-2.5 w-2.5 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-indigo-500" />
                                                    </a>
                                                    <StatusPill status={p.projectStatus} />
                                                </div>
                                                <p className="mt-0.5 line-clamp-2 text-sm font-medium text-slate-800">
                                                    {p.projectName}
                                                </p>
                                                <div className="mt-2">
                                                    <ComplianceBar
                                                        filled={p.compliance.filledTotal}
                                                        total={p.compliance.requiredTotal}
                                                        level={p.compliance.level}
                                                    />
                                                </div>
                                                {(p.flags.length > 0 || p.consistencyFlags.length > 0) && (
                                                    <div className="mt-2">
                                                        <FlagChips flags={p.flags} consistencyFlags={p.consistencyFlags} />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="mt-1 text-slate-400">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                ) : (
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                )}
                                            </span>
                                        </div>
                                        {isExpanded && (
                                            <div className="border-l-2 border-l-indigo-300 bg-slate-50 px-4 pb-4">
                                                <ProjectDrillDown project={p} today={todayRef} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                                <p className="text-[11px] text-slate-500">
                                    Showing{' '}
                                    <span className="font-medium text-slate-700">
                                        {(currentPage - 1) * PROJECTS_PER_PAGE + 1}–
                                        {Math.min(currentPage * PROJECTS_PER_PAGE, filtered.length)}
                                    </span>{' '}
                                    of {filtered.length}
                                </p>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </Section>

            <CompletenessFieldSummary projects={enriched} today={todayRef} />
            <ComprehensivenessSummary projects={enriched} today={todayRef} />
        </div>
    );
}