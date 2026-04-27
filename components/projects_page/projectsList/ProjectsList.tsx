// ─── components/projects_page/projectsList/ProjectsList.tsx ────────────

'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ProjectCard } from './ProjectCard';

export type Project = {
    id: string | number;
    code: string;
    name: string;
    location: string;
    organizationShort: string;
    investmentArea: string;
    status: string;
    committed: string;
    projectLead?: string;
    imageKey?: string;
    programAdminId?: number | null;
    INVESTMENT_PROGRAM_PERIOD_PERIOD_ID?: number | string | null;
};

// ─── Pagination ───────────────────────────────────────────────────────
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
    loading: boolean;
    onPageChange: (page: number) => void;
}

function Pagination({
                        currentPage,
                        totalPages,
                        totalCount,
                        itemsPerPage,
                        loading,
                        onPageChange,
                    }: PaginationProps) {
    if (totalPages <= 1 && totalCount === 0) return null;

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex   = Math.min(currentPage * itemsPerPage, totalCount);

    // Build page number window: always show first, last, current ± 1, with ellipsis
    function getPageNumbers(): (number | '…')[] {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | '…')[] = [1];

        if (currentPage > 3) pages.push('…');

        const rangeStart = Math.max(2, currentPage - 1);
        const rangeEnd   = Math.min(totalPages - 1, currentPage + 1);

        for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push('…');

        pages.push(totalPages);

        return pages;
    }

    const pages = getPageNumbers();

    return (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
            {/* Left: record range */}
            <p className="text-xs text-slate-400">
                {totalCount > 0 ? (
                    <>
                        <span className="font-medium text-slate-600">{startIndex.toLocaleString()}–{endIndex.toLocaleString()}</span>
                        {' '}of{' '}
                        <span className="font-medium text-slate-600">{totalCount.toLocaleString()}</span>
                    </>
                ) : '0 results'}
            </p>

            {/* Right: page controls */}
            <div className="flex items-center gap-1">
                {/* First page */}
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1 || loading}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="First page"
                >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                </button>

                {/* Prev page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-0.5">
                    {pages.map((p, i) =>
                        p === '…' ? (
                            <span
                                key={`ellipsis-${i}`}
                                className="flex h-7 w-7 items-center justify-center text-xs text-slate-400"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p as number)}
                                disabled={loading}
                                className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1.5 text-xs font-medium transition-colors disabled:pointer-events-none ${
                                    p === currentPage
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                            >
                                {p}
                            </button>
                        ),
                    )}
                </div>

                {/* Next page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Next page"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>

                {/* Last page */}
                <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage >= totalPages || loading}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Last page"
                >
                    <ChevronsRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

// ─── Props ───────────────────────────────────────────────────────────
interface ProjectsListProps {
    projects: Project[];
    loading: boolean;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    categoryFilter?: string | null;
    onClearFilter?: () => void;
    /** Rendered in the search bar area (search input + filter/export buttons) */
    toolbar?: React.ReactNode;
    /** Rendered between toolbar and count bar (applied filter pills) */
    filterPills?: React.ReactNode;
    /** The signed-in user's custom:organization from Cognito session */
    userOrganization?: string | null;
}

export function ProjectsList({
                                 projects,
                                 loading,
                                 totalCount,
                                 currentPage,
                                 totalPages,
                                 itemsPerPage,
                                 onPageChange,
                                 categoryFilter,
                                 onClearFilter,
                                 toolbar,
                                 filterPills,
                                 userOrganization,
                             }: ProjectsListProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* Category filter banner */}
            <AnimatePresence>
                {categoryFilter && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">Filtered by:</span>
                            <span className="rounded-md bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">
                                {categoryFilter}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClearFilter}
                            className="text-xs text-slate-600 hover:text-slate-900"
                        >
                            Clear
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toolbar slot (search + filters + export) */}
            {toolbar && (
                <div className="flex items-center gap-2 border-b border-slate-200 p-3">
                    {toolbar}
                </div>
            )}

            {/* Applied filter pills slot */}
            <AnimatePresence>
                {filterPills}
            </AnimatePresence>

            {/* Count */}
            <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs">
                <div>
                    <span className="font-semibold text-slate-900">{totalCount.toLocaleString()}</span>
                    <span className="ml-1 text-slate-500">Projects</span>
                </div>
            </div>

            {/* Project rows */}
            <div className="relative max-h-[800px] overflow-y-auto">
                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-400">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-400">No projects found.</div>
                ) : (
                    projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            userOrganization={userOrganization}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                itemsPerPage={itemsPerPage}
                loading={loading}
                onPageChange={onPageChange}
            />
        </div>
    );
}