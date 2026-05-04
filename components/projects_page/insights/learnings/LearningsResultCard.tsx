// components/projects_page/insights/learnings/LearningsResultCard.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { LearningsProject, NarrativeLens } from './shared/types';
import { buildExcerpt, highlightMatches } from './shared/snippet';
import { LENS_OPTIONS } from './shared/types';

interface LearningsResultCardProps {
    project: LearningsProject;
    activeLens: NarrativeLens | null;
    searchTerm: string;
}

const formatFunding = (amount: number) => {
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
};

const lensLabel = (key: NarrativeLens) =>
    LENS_OPTIONS.find((l) => l.key === key)?.label ?? key;

export function LearningsResultCard({
    project,
    activeLens,
    searchTerm,
}: LearningsResultCardProps) {
    const router = useRouter();

    const excerpt = buildExcerpt(project.narrative, searchTerm, 280);

    // Show the source label only when it differs from the user's pick — that way
    // people understand why they're seeing summary text when they asked for "innovations".
    const sourceMismatch =
        activeLens !== null &&
        project.narrativeSource !== null &&
        project.narrativeSource !== activeLens;

    return (
        <article className="rounded-md border border-slate-200 bg-white p-4 transition hover:border-slate-300 md:p-5">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {project.projectNumber || '—'}
                </span>
                {project.projectStatus && (
                    <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                        {project.projectStatus}
                    </span>
                )}
            </div>

            <h4 className="mb-2 text-sm font-semibold text-slate-900">
                {highlightMatches(project.projectName ?? 'Untitled project', searchTerm)}
            </h4>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span>
                    <span className="font-medium text-slate-700">Lead:</span>{' '}
                    {project.projectLead || 'Not listed'}
                </span>
                <span>
                    <span className="font-medium text-slate-700">Committed:</span>{' '}
                    {formatFunding(project.committedFunding)}
                </span>
                {project.investmentAreas.length > 0 && (
                    <span className="truncate">
                        <span className="font-medium text-slate-700">Areas:</span>{' '}
                        {project.investmentAreas.slice(0, 3).join(', ')}
                        {project.investmentAreas.length > 3 &&
                            ` +${project.investmentAreas.length - 3}`}
                    </span>
                )}
            </div>

            {/* Lens-driven narrative excerpt */}
            {excerpt && (
                <div className="mt-3 border-l-2 border-slate-200 pl-3">
                    {sourceMismatch && project.narrativeSource && (
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Showing {lensLabel(project.narrativeSource)} (no{' '}
                            {lensLabel(activeLens!).toLowerCase()} available)
                        </p>
                    )}
                    <p className="text-[13px] leading-relaxed text-slate-600">
                        {highlightMatches(excerpt, searchTerm)}
                    </p>
                </div>
            )}

            <div className="mt-4">
                <button
                    type="button"
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                >
                    View project <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </article>
    );
}
