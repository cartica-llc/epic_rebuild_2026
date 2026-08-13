// components/projects_page/insights/spending/tabs/CommunityRequirementsTab.tsx

'use client';

import { useInsightFetch } from '../shared/useInsightFetch';
import {
    ChartSkeleton,
    EmptyState,
    ErrorState,
    SectionCard,
} from '../shared/SectionCard';
import { formatMoneyShort, formatPct } from '../shared/format';

interface CommunityResponse {
    overall: {
        totalSpent: number;
        dacLiSpent: number;
        dacLiPct: number;
        minRequiredPct: number;
        meetsRequirement: boolean;
    };
    byPeriod: {
        period: string;
        totalSpent: number;
        dacLiSpent: number;
        dacLiPct: number;
    }[];
    byArea: {
        name: string;
        totalSpent: number;
        dacLiSpent: number;
        dacLiPct: number;
    }[];
}

interface Props {
    queryString: string;
}

// One short tag, reused as-is everywhere DAC/LI data needs the caveat.
const UNVERIFIED_NOTE = 'Self-reported · unverified';

export default function CommunityRequirementsTab({ queryString }: Props) {
    const { data, loading, error } = useInsightFetch<CommunityResponse>(
        `/api/spending/community?${queryString}`,
    );

    const overall = data?.overall;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card
                    label="Total Expended"
                    value={formatMoneyShort(overall?.totalSpent ?? 0)}
                    loading={loading}
                />
                <Card
                    label="DAC / LI Expended"
                    value={formatMoneyShort(overall?.dacLiSpent ?? 0)}
                    loading={loading}
                    note={UNVERIFIED_NOTE}
                />
                <Card
                    label="DAC / LI Share"
                    value={overall ? formatPct(overall.dacLiPct, 1) : '0%'}
                    loading={loading}
                    note={UNVERIFIED_NOTE}
                />
                <Card
                    label="Requirement"
                    value={
                        overall
                            ? `${overall.minRequiredPct}% min`
                            : '—'
                    }
                    loading={loading}
                    note={UNVERIFIED_NOTE}
                />
            </div>

            <SectionCard
                title="DAC / LI share by period"
                description={`Minimum required: ${overall?.minRequiredPct ?? 25}% · ${UNVERIFIED_NOTE}`}
            >
                {loading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !data?.byPeriod.length ? (
                    <EmptyState message="No data for the current filters." />
                ) : (
                    <ul className="space-y-3">
                        {data.byPeriod.map((p) => (
                            <li key={p.period}>
                                <div className="mb-1 flex items-baseline justify-between text-xs">
                                    <span className="font-medium text-slate-700">
                                        {p.period}
                                    </span>
                                    <span className="text-slate-500">
                                        {formatPct(p.dacLiPct)} ·{' '}
                                        {formatMoneyShort(p.dacLiSpent)} of{' '}
                                        {formatMoneyShort(p.totalSpent)}
                                    </span>
                                </div>
                                <div className="relative h-2.5 overflow-hidden rounded-sm bg-slate-100">
                                    <div
                                        className="h-full bg-slate-500"
                                        style={{ width: `${Math.min(100, p.dacLiPct)}%` }}
                                    />
                                    <div
                                        className="absolute top-0 h-full border-l border-dashed border-slate-400"
                                        style={{ left: `${overall?.minRequiredPct ?? 25}%` }}
                                        aria-hidden="true"
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>

            <SectionCard
                title="DAC / LI share by investment area"
                description={`Top 12 areas by DAC/LI expenditure · ${UNVERIFIED_NOTE}`}
            >
                {loading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !data?.byArea.length ? (
                    <EmptyState message="No data for the current filters." />
                ) : (
                    <ul className="space-y-2">
                        {data.byArea.map((a) => (
                            <li
                                key={a.name}
                                className="flex items-baseline justify-between gap-3 text-xs"
                            >
                                <span className="truncate text-slate-700">{a.name}</span>
                                <span className="flex-shrink-0 font-medium text-slate-900">
                                    {formatPct(a.dacLiPct)}{' '}
                                    <span className="font-normal text-slate-400">
                                        · {formatMoneyShort(a.dacLiSpent)}
                                    </span>
                                </span>
                            </li>
                        ))}
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
                  note,
              }: {
    label: string;
    value: string;
    loading: boolean;
    note?: string;
}) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
            {loading ? (
                <div className="mt-2 h-7 w-24 animate-pulse rounded bg-slate-100" />
            ) : (
                <>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
                    {note ? (
                        <p className="mt-1 text-[10px] text-slate-400">{note}</p>
                    ) : null}
                </>
            )}
        </div>
    );
}