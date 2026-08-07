// components/projects_page/insights/spending/tabs/AwardSizeTab.tsx

'use client';

import { useInsightFetch } from '../shared/useInsightFetch';
import {
    ChartSkeleton,
    EmptyState,
    ErrorState,
    SectionCard,
} from '../shared/SectionCard';
import { formatCount, formatMoneyShort } from '../shared/format';
import { AWARD_BANDS, bandToProjectsHref } from '../shared/awardbands';

interface AwardsResponse {
    summary: {
        projectCount: number;
        average: number;
        median: number;
        min: number;
        max: number;
    };
    bands: { band: string; order: number; projectCount: number; amount: number }[];
}

interface Props {
    queryString: string;
}

export default function AwardSizeTab({ queryString }: Props) {
    const { data, loading, error } = useInsightFetch<AwardsResponse>(
        `/api/spending/awards?${queryString}`,
    );

    return (
        <div className="space-y-5">
            <p className="text-xs text-slate-500">
                An <span className="font-medium text-slate-700">award</span> is the committed
                funding amount for a single project. This tab shows how award sizes are
                distributed across the projects matching your filters — from the smallest awards
                to the largest.
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card
                    label="Projects"
                    value={formatCount(data?.summary.projectCount ?? 0)}
                    loading={loading}
                    hint="Number of projects with committed funding that match the current filters."
                />
                <Card
                    label="Average Award"
                    value={formatMoneyShort(data?.summary.average ?? 0)}
                    loading={loading}
                    hint="Total committed funding divided by the number of projects. A few very large awards can pull this up."
                />
                <Card
                    label="Median Award"
                    value={formatMoneyShort(data?.summary.median ?? 0)}
                    loading={loading}
                    hint="The middle award amount when all projects are ranked by committed funding — less affected by unusually large or small awards than the average."
                />
                <Card
                    label="Largest Award"
                    value={formatMoneyShort(data?.summary.max ?? 0)}
                    loading={loading}
                    hint="The single largest committed-funding amount among the filtered projects."
                />
            </div>

            <SectionCard
                title="Distribution by award size"
                description="Number of projects in each committed-funding band, from smallest to largest. Click a count to view the projects in that band."
            >
                {loading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !data?.bands.length ? (
                    <EmptyState message="No data for the current filters." />
                ) : (
                    <ul className="space-y-2.5">
                        {data.bands.map((b) => {
                            const max = data.bands.reduce(
                                (m, x) => Math.max(m, x.projectCount),
                                0,
                            );
                            const pct = max > 0 ? (b.projectCount / max) * 100 : 0;
                            const bandDef = AWARD_BANDS.find((d) => d.order === b.order);
                            const href = bandDef ? bandToProjectsHref(bandDef) : null;

                            return (
                                <li key={b.band}>
                                    <div className="mb-1 flex items-baseline justify-between text-xs">
                                        <span className="text-slate-700">{b.band}</span>
                                        <span className="font-medium text-slate-900">
                                            {href ? (
                                                <a
                                                    href={href}
                                                    className="rounded-sm underline-offset-2 transition hover:text-indigo-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                                    title={`View projects in ${b.band}`}
                                                >
                                                    {formatCount(b.projectCount)} project{b.projectCount === 1 ? '' : 's'}
                                                </a>
                                            ) : (
                                                `${formatCount(b.projectCount)} project${b.projectCount === 1 ? '' : 's'}`
                                            )}
                                            <span className="ml-1 text-slate-400">
                                                · {formatMoneyShort(b.amount)} total
                                            </span>
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
                                        <div
                                            className="h-full bg-emerald-400"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </SectionCard>
        </div>
    );
}

function Card({
                  label,
                  value,
                  loading,
                  hint,
              }: {
    label: string;
    value: string;
    loading: boolean;
    hint?: string;
}) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-500">
                {label}
                {hint ? (
                    <span
                        className="inline-flex h-3.5 w-3.5 flex-shrink-0 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] normal-case not-italic text-slate-400"
                        title={hint}
                        aria-label={hint}
                    >
                        i
                    </span>
                ) : null}
            </p>
            {loading ? (
                <div className="mt-2 h-7 w-24 animate-pulse rounded bg-slate-100" />
            ) : (
                <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
            )}
        </div>
    );
}