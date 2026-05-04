// components/projects_page/insights/learnings/LearningsResults.tsx

'use client';

import { LearningsResultCard } from './LearningsResultCard';
import type { LearningsProject, NarrativeLens } from './shared/types';
import { LENS_OPTIONS } from './shared/types';

interface LearningsResultsProps {
    projects: LearningsProject[];
    totalCommitted: number;
    count: number;
    truncated: boolean;
    limit: number;
    loading: boolean;
    error: string | null;
    activeLens: NarrativeLens | null;
    searchTerm: string;
    activeFilterCount: number;
}

const formatFunding = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${Math.round(amount).toLocaleString()}`;
};

export function LearningsResults({
    projects,
    totalCommitted,
    count,
    truncated,
    limit,
    loading,
    error,
    activeLens,
    searchTerm,
    activeFilterCount,
}: LearningsResultsProps) {
    const lensLabel = activeLens
        ? (LENS_OPTIONS.find((l) => l.key === activeLens)?.label ?? activeLens)
        : 'Best available';

    return (
        <div className="space-y-5 px-4 py-5 md:px-6 md:py-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <SummaryCard
                    label="Projects"
                    value={loading ? null : count.toLocaleString()}
                    sub={truncated ? `Showing top ${limit}` : undefined}
                />
                <SummaryCard
                    label="Committed Funding"
                    value={loading ? null : formatFunding(totalCommitted)}
                />
                <SummaryCard
                    label="Active Lens"
                    value={lensLabel}
                />
                <SummaryCard
                    label="Filters Applied"
                    value={activeFilterCount.toLocaleString()}
                />
            </div>

            {/* Body */}
            {loading ? (
                <ResultsSkeleton />
            ) : error ? (
                <div className="rounded-md border border-dashed border-red-200 bg-red-50 p-10 text-center">
                    <p className="mb-1 text-sm font-semibold text-red-900">
                        Couldn&apos;t load results
                    </p>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-white p-10 text-center">
                    <p className="mb-1 text-sm font-semibold text-slate-900">
                        No matching projects
                    </p>
                    <p className="text-sm text-slate-500">
                        Try a broader term or adjust filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <LearningsResultCard
                            key={project.id}
                            project={project}
                            activeLens={activeLens}
                            searchTerm={searchTerm}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Subcomponents ───────────────────────────────────────────────────────

function SummaryCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: string | null;
    sub?: string;
}) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
            {value === null ? (
                <div className="mt-2 h-7 w-20 animate-pulse rounded bg-slate-100" />
            ) : (
                <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
            )}
            {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
        </div>
    );
}

function ResultsSkeleton() {
    return (
        <div className="space-y-4" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-md border border-slate-200 bg-white p-5"
                >
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                    <div className="mt-3 h-4 w-3/5 animate-pulse rounded bg-slate-100" />
                    <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
            ))}
        </div>
    );
}
