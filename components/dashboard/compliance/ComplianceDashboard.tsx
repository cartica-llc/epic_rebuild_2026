// components/dashboard/compliance/ComplianceDashboard.tsx
'use client';

import React from 'react';
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Download,
    Filter,
    Search,
    X,
} from 'lucide-react';

import { exportComplianceToExcel } from './exportExcel';
import { PROJECTS_PER_PAGE } from './fieldRequirements';
import { enrichProject, isOutOfCompliance } from './helpers';
import { Pagination } from './Pagination';
import { ProjectDrillDown } from './ProjectDrillDown';
import type { ComplianceProject, EnrichedProject, FlagId } from './types';
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

type ViewFilter = 'out-of-compliance' | 'compliant' | 'flagged';

const VIEW_LABELS: Record<ViewFilter, string> = {
    'out-of-compliance': 'Out of compliance',
    compliant: 'Compliant',
    flagged: 'Flagged',
};

// Display labels for the flag-filter dropdown. Slightly more verbose than
// the chip's 'short' field since the dropdown has the room — "Closed but
// Incomplete" reads more clearly than "Closed Incomplete" out of context.
const FLAG_LABELS: Record<FlagId, string> = {
    'past-end-date': 'Past End Date',
    'no-recent-update': 'No Recent Update',
    'closed-incomplete': 'Closed but Incomplete',
};

export function ComplianceDashboard({ projects, today }: ComplianceDashboardProps) {
    const [todayRef] = React.useState<Date>(() => today ?? new Date());

    // ── Filters ──
    const [statusFilter, setStatusFilter] = React.useState('All');
    const [periodFilter, setPeriodFilter] = React.useState('All');
    const [adminFilter, setAdminFilter] = React.useState('All');

    const [flagFilter, setFlagFilter] = React.useState<FlagId | 'All'>('All');

    const [viewFilter, setViewFilter] = React.useState<ViewFilter>('out-of-compliance');
    const [searchTerm, setSearchTerm] = React.useState('');

    const [expandedId, setExpandedId] = React.useState<number | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);


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
    const handleFlagFilter = (v: FlagId | 'All') => {
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

    // ── Enrichment + portfolio totals (all projects) ──
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
                p.compliance.stageResults.some((s) => s.stage === 'Closeout'),
        ).length;

        return { compliant, flagged, outOfCompliance, closedComplete, total: enriched.length };
    }, [enriched]);

    const baseSet = React.useMemo(() => {
        switch (viewFilter) {
            case 'compliant':
                return enriched.filter((p) => p.compliance.level === 'green');
            case 'flagged':
                return enriched.filter((p) => p.flags.length > 0);
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


    const filtered = React.useMemo(() => {
        return baseSet.filter((p) => {
            if (statusFilter !== 'All' && p.projectStatus !== statusFilter) return false;
            if (periodFilter !== 'All' && p.epicPeriod !== periodFilter) return false;
            if (adminFilter !== 'All' && p.programAdmin !== adminFilter) return false;

            if (flagFilter !== 'All' && !p.flags.some((f) => f.id === flagFilter)) {
                return false;
            }

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
    }, [baseSet, statusFilter, periodFilter, adminFilter, flagFilter, searchTerm]);

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

    // ── Export ──
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
            {/* ─── Header ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-slate-500" />
                        <h2 className="text-base font-semibold text-slate-900">
                            Compliance &amp; Operational Tracking
                        </h2>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {VIEW_LABELS[viewFilter]} ·{' '}
                        <span className="font-medium text-slate-700">{baseSet.length}</span>{' '}
                        of {totals.total} projects
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting || enriched.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download className="h-3.5 w-3.5" />
                    {isExporting ? 'Exporting…' : 'Export Excel'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                    help="Projects with every required field filled for their current status. Includes closed-out projects with all Entry, Active, and Closeout fields complete. Click to filter."
                    onClick={() => handleViewFilter('compliant')}
                    active={viewFilter === 'compliant'}
                />
                <StatCard
                    label="Flagged"
                    value={totals.flagged.toString()}
                    sub="Operational alerts"
                    accent="flag"
                    help="Projects with one or more operational issues: a past end date, no modifications in 90+ days (Pending or Active, with end date past), or a Completed project still missing Active/Closeout fields. Click to filter."
                    onClick={() => handleViewFilter('flagged')}
                    active={viewFilter === 'flagged'}
                />
            </div>

            {/* ─── Filter toolbar ─── */}
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative min-w-[180px] flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search project name or number…"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

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
                    <FilterSelect
                        aria-label="Flag"
                        value={flagFilter}
                        onChange={(v) => handleFlagFilter(v as FlagId | 'All')}
                        options={[
                            { value: 'All', label: 'All Flags' },
                            ...(Object.entries(FLAG_LABELS) as [FlagId, string][]).map(
                                ([id, label]) => ({ value: id, label }),
                            ),
                        ]}
                    />

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={reset}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:text-slate-900"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}

                    <span className="ml-auto text-[11px] text-slate-500">
                        <Filter className="-mt-0.5 mr-1 inline-block h-3 w-3" />
                        {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
                    </span>
                </div>
            </div>

            {/* ─── Project list ─── */}
            <Section padded={false}>
                {paginated.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        {baseSet.length === 0 ? (

                            viewFilter === 'out-of-compliance' ? (
                                <>
                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-50">
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
                        {/* Desktop table */}
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
                                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-500">
                                    <th className="py-2.5 pl-4" />
                                    <th className="py-2.5 pr-3 font-medium">Project</th>
                                    <th className="py-2.5 pr-3 font-medium">Status</th>
                                    <th className="py-2.5 pr-3 font-medium">Period</th>
                                    <th className="py-2.5 pr-3 font-medium">Fields</th>
                                    <th className="py-2.5 pr-3 font-medium">Flags</th>
                                    <th className="py-2.5 pr-4" />
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
                                                className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50/60"
                                            >
                                                {/* Severity dot */}
                                                <td className="py-3 pl-4">
                                                        <span
                                                            className={`inline-block h-2 w-2 rounded-full ${LEVEL_DOT[p.compliance.level]}`}
                                                            title={p.compliance.level === 'green' ? 'Compliant' : 'Incomplete'}
                                                        />
                                                </td>

                                                {/* Project number + name */}
                                                <td className="py-3 pr-3">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                            <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-500">
                                                                {p.projectNumber}
                                                            </span>
                                                        <span
                                                            className="min-w-0 flex-1 truncate font-medium text-slate-800"
                                                            title={p.projectName}
                                                        >
                                                                {p.projectName}
                                                            </span>
                                                    </div>
                                                </td>

                                                <td className="py-3 pr-3">
                                                    <StatusPill status={p.projectStatus} />
                                                </td>

                                                <td className="py-3 pr-3 text-[11px] text-slate-500">
                                                    {p.epicPeriod || '—'}
                                                </td>

                                                {/* Compliance bar */}
                                                <td className="py-3 pr-3">
                                                    <div className="w-32">
                                                        <ComplianceBar
                                                            filled={p.compliance.filledTotal}
                                                            total={p.compliance.requiredTotal}
                                                            level={p.compliance.level}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Flags */}
                                                <td className="py-3 pr-3">
                                                    <FlagChips flags={p.flags} />
                                                </td>

                                                {/* Chevron */}
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
                                                    <td colSpan={7} className="bg-slate-50/40 px-6 py-4">
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

                        {/* Mobile cards */}
                        <div className="divide-y divide-slate-100 lg:hidden">
                            {paginated.map((p) => {
                                const isExpanded = expandedId === p.projectId;
                                return (
                                    <div key={p.projectId}>
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : p.projectId)}
                                            className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50/60"
                                        >
                                            <span
                                                className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT[p.compliance.level]}`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-[11px] tabular-nums text-slate-500">
                                                        {p.projectNumber}
                                                    </span>
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
                                                {p.flags.length > 0 && (
                                                    <div className="mt-2">
                                                        <FlagChips flags={p.flags} />
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
                                        </button>
                                        {isExpanded && (
                                            <div className="bg-slate-50/40 px-4 pb-4">
                                                <ProjectDrillDown project={p} today={todayRef} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
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
        </div>
    );
}