// ─── components/projects_page/projectsList/ProjectsList.tsx ────────────
// Presentational list component. Receives data via props.
// Slots: toolbar (search + filter button), filterPills (applied filter strip).

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ProjectCard } from './ProjectCard';

// ─── Types ───────────────────────────────────────────────────────────
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
    /** Snowflake PROGRAM_ADMIN_PROGRAM_ADMIN_ID — used for org-based edit authorization */
    programAdminId?: number | null;
    /** Snowflake INVESTMENT_PROGRAM_PERIOD_PERIOD_ID */
    INVESTMENT_PROGRAM_PERIOD_PERIOD_ID?: number | string | null;
};

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
    const startIndex = (currentPage - 1) * itemsPerPage;

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
                    <span className="font-semibold text-slate-900">{totalCount}</span>
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
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5">
                <p className="text-xs text-slate-500">
                    {totalCount > 0
                        ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalCount)} of ${totalCount}`
                        : '0 results'}
                </p>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || loading}
                        className="rounded p-1 text-slate-600 disabled:text-slate-300"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-2 text-xs text-slate-600">
                        {currentPage} / {Math.max(1, totalPages)}
                    </span>
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages || loading}
                        className="rounded p-1 text-slate-600 disabled:text-slate-300"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}