// components/projects_page/insights/market/MarketProjectsTable.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useInsightFetch } from '../spending/shared/useInsightFetch';
import { ProxyTooltip, SIGNAL_PROXY_EXPLANATION } from './ProxyTooltip';
import { scorePillClass } from './shared/colors';
import type { MarketProject } from './shared/types';

interface ProjectsResponse {
    projects: MarketProject[];
    count: number;
    truncated: boolean;
    limit: number;
}

interface MarketProjectsTableProps {
    queryString: string;
    hasActiveFilters: boolean;
}

export function MarketProjectsTable({
    queryString,
    hasActiveFilters,
}: MarketProjectsTableProps) {
    const router = useRouter();
    const { data, loading, error } = useInsightFetch<ProjectsResponse>(
        `/api/market/projects?${queryString}`,
    );

    const projects = data?.projects ?? [];

    return (
        <section className="rounded-md border border-slate-200 bg-white p-5 md:p-6">
            <header className="mb-5">
                <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-slate-900">
                        High-potential projects
                    </h4>
                    <ProxyTooltip {...SIGNAL_PROXY_EXPLANATION} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                    {hasActiveFilters
                        ? `Showing ${data?.count ?? 0} project${data?.count === 1 ? '' : 's'} matching the current filters.`
                        : 'Sorted by highest signal score across the full portfolio.'}
                    {data?.truncated && (
                        <span className="ml-1 text-amber-700">
                            Top {data.limit} shown.
                        </span>
                    )}
                </p>
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
            ) : projects.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-900">
                        No matching projects
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Try a broader maturity stage or lower the score threshold.
                    </p>
                </div>
            ) : (
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
                                        {p.maturity}
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${scorePillClass(p.signalScore)}`}
                                            title={`${p.signalBand} signal — proxy indicator`}
                                        >
                                            {p.signalScore}/5
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.push(`/projects/${p.id}`)
                                            }
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
            )}
        </section>
    );
}

// ─── Helpers ────────────────────────────────────────────────────────────
function truncate(s: string | null, max: number): string {
    if (!s) return 'Untitled project';
    return s.length > max ? `${s.slice(0, max)}…` : s;
}

function TableSkeleton() {
    return (
        <div className="space-y-2" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 border-b border-slate-100 py-3"
                >
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
