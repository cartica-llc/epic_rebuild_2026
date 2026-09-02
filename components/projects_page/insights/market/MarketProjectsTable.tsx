// components/projects_page/insights/market/MarketProjectsTable.tsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInsightFetch } from '../spending/shared/useInsightFetch';
import { ProxyTooltip, SIGNAL_PROXY_EXPLANATION } from './ProxyTooltip';
import { MATURITY_STAGE_LABEL, scorePillClass, SIGNAL_BAND_LABEL } from './shared/colors';
import type { MarketProject } from './shared/types';

const PAGE_SIZE = 15;

interface ProjectsResponse {
    projects: MarketProject[];
    count: number;
    truncated: boolean;
    limit: number;
}

interface MarketProjectsTableProps {
    queryString: string;
    hasActiveFilters: boolean;
    scoreFilter: number;
}

export function MarketProjectsTable({
                                        queryString,
                                        hasActiveFilters,
                                        scoreFilter,
                                    }: MarketProjectsTableProps) {
    const router = useRouter();
    const { data, loading, error } = useInsightFetch<ProjectsResponse>(
        `/api/market/projects?${queryString}`,
    );

    const [page, setPage] = useState(1);

    const visibleProjects = useMemo(() => {
        const all = data?.projects ?? [];
        if (scoreFilter === 0) {
            return [...all].sort((a, b) => b.signalScore - a.signalScore);
        }
        return all
            .filter((p) => p.signalScore === scoreFilter)
            .sort((a, b) => a.projectNumber?.localeCompare(b.projectNumber ?? '') ?? 0);
    }, [data, scoreFilter]);

    const totalPages = Math.max(1, Math.ceil(visibleProjects.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const projects = visibleProjects.slice(start, start + PAGE_SIZE);

    const resultLabel = () => {
        if (scoreFilter > 0) {
            return `${visibleProjects.length} project${visibleProjects.length === 1 ? '' : 's'} with a score of ${scoreFilter} / 5.`;
        }
        if (hasActiveFilters) {
            return `${visibleProjects.length} project${visibleProjects.length === 1 ? '' : 's'} match the current filters.`;
        }
        return 'Sorted by highest signal score across the full portfolio.';
    };

    return (
        <section className="rounded-md border border-slate-200 bg-white p-5 md:p-6">
            <header className="mb-5">
                <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-slate-900">
                        Possible high-potential projects
                    </h4>
                    <ProxyTooltip {...SIGNAL_PROXY_EXPLANATION} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{resultLabel()}</p>
            </header>

            {loading ? (
                <TableSkeleton />
            ) : error ? (
                <div className="rounded-md border border-dashed border-red-200 bg-red-50 p-10 text-center">
                    <p className="text-sm font-semibold text-red-900">
                        Couldn&apos;t load projects
                    </p>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
            ) : visibleProjects.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-900">
                        No matching projects
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {scoreFilter > 0
                            ? `No projects have a signal score of exactly ${scoreFilter}.`
                            : 'Try a broader maturity stage or adjust the score filter.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-3 py-3">Project</th>
                                <th className="px-3 py-3">Maturity</th>
                                <th className="px-3 py-3 text-right">Score</th>
                                <th className="px-3 py-3 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {projects.map((p, i) => (
                                <tr
                                    key={p.id}
                                    className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}
                                >
                                    <td className="px-3 py-3">
                                        <p className="text-xs font-medium text-slate-800">
                                            {p.projectNumber || '—'}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                            {truncate(p.projectName, 60)}
                                        </p>
                                        {p.leadCompany && (
                                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                                {p.leadCompany}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-xs text-slate-600">
                                        {MATURITY_STAGE_LABEL[p.maturity]}
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${scorePillClass(p.signalScore)}`}
                                                title={`${SIGNAL_BAND_LABEL[p.signalBand]} signal — proxy indicator`}
                                            >
                                                {p.signalScore}/5
                                            </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/projects/${p.id}`)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                                        >
                                            View
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                            <p className="text-[11px] text-slate-400">
                                {start + 1}–{Math.min(start + PAGE_SIZE, visibleProjects.length)}{' '}
                                of {visibleProjects.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <PageButton
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </PageButton>
                                {getPageNumbers(safePage, totalPages).map((n, i) =>
                                    n === '…' ? (
                                        <span key={`ellipsis-${i}`} className="px-1 text-[11px] text-slate-400">
                                            …
                                        </span>
                                    ) : (
                                        <PageButton
                                            key={n}
                                            onClick={() => setPage(n as number)}
                                            active={safePage === n}
                                        >
                                            {n}
                                        </PageButton>
                                    ),
                                )}
                                <PageButton
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </PageButton>
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (current > 3) pages.push('…');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('…');
    pages.push(total);
    return pages;
}

interface PageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    children: React.ReactNode;
}

function PageButton({ active, children, className = '', ...props }: PageButtonProps) {
    return (
        <button
            type="button"
            className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-[11px] font-medium transition
                ${active
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40'
            } ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

function truncate(s: string | null, max: number): string {
    if (!s) return 'Untitled project';
    return s.length > max ? `${s.slice(0, max)}…` : s;
}

function TableSkeleton() {
    return (
        <div className="space-y-2" aria-hidden="true">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-slate-100 py-3">
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-5 w-12 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
                </div>
            ))}
        </div>
    );
}