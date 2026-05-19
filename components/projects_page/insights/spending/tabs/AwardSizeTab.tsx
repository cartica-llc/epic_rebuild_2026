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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card
                    label="Projects"
                    value={formatCount(data?.summary.projectCount ?? 0)}
                    loading={loading}
                />
                <Card
                    label="Average Award"
                    value={formatMoneyShort(data?.summary.average ?? 0)}
                    loading={loading}
                />
                <Card
                    label="Median Award"
                    value={formatMoneyShort(data?.summary.median ?? 0)}
                    loading={loading}
                />
                <Card
                    label="Largest Award"
                    value={formatMoneyShort(data?.summary.max ?? 0)}
                    loading={loading}
                />
            </div>

            <SectionCard
                title="Distribution by award size"
                description="Number of projects in each committed-funding band. Click a count to view the projects."
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

function Card({ label, value, loading }: { label: string; value: string; loading: boolean }) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
            {loading ? (
                <div className="mt-2 h-7 w-24 animate-pulse rounded bg-slate-100" />
            ) : (
                <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
            )}
        </div>
    );
}