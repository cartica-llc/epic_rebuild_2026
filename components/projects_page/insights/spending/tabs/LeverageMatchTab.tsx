// components/projects_page/insights/spending/tabs/LeverageMatchTab.tsx

'use client';

import { useInsightFetch } from '../shared/useInsightFetch';
import {
    ChartSkeleton,
    EmptyState,
    ErrorState,
    SectionCard,
} from '../shared/SectionCard';
import { formatMoneyShort, formatPct } from '../shared/format';

interface LeverageResponse {
    totals: {
        matchFunding: number;
        leveragedFunds: number;
        contractAmount: number;
        averageMatchSplit: number;
        ratio: number;
        projectCount: number;
    };
    byPeriod: {
        period: string;
        match: number;
        leveraged: number;
        contract: number;
    }[];
    byArea: { name: string; match: number; leveraged: number }[];
}

interface Props {
    queryString: string;
}

export default function LeverageMatchTab({ queryString }: Props) {
    const { data, loading, error } = useInsightFetch<LeverageResponse>(
        `/api/spending/leverage?${queryString}`,
    );

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card
                    label="Match Funding"
                    value={formatMoneyShort(data?.totals.matchFunding ?? 0)}
                    loading={loading}
                />
                <Card
                    label="Leveraged Funds"
                    value={formatMoneyShort(data?.totals.leveragedFunds ?? 0)}
                    loading={loading}
                />
                <Card
                    label="Contract Amount"
                    value={formatMoneyShort(data?.totals.contractAmount ?? 0)}
                    loading={loading}
                />
                <Card
                    label="Leverage Ratio"
                    value={
                        data
                            ? `${(data.totals.ratio * 100).toFixed(0)}%`
                            : '0%'
                    }
                    loading={loading}
                />
            </div>

            <SectionCard
                title="Match & leveraged funds by period"
                description="Stacked totals against contract amount."
            >
                {loading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !data?.byPeriod.length ? (
                    <EmptyState message="No data for the current filters." />
                ) : (
                    <ul className="space-y-3">
                        {data.byPeriod.map((p) => {
                            const total = p.match + p.leveraged + p.contract;
                            const matchPct = total > 0 ? (p.match / total) * 100 : 0;
                            const leveragedPct = total > 0 ? (p.leveraged / total) * 100 : 0;
                            const contractPct = total > 0 ? (p.contract / total) * 100 : 0;
                            return (
                                <li key={p.period}>
                                    <div className="mb-1 flex items-baseline justify-between text-xs">
                                        <span className="font-medium text-slate-700">
                                            {p.period}
                                        </span>
                                        <span className="text-slate-500">
                                            {formatMoneyShort(total)}
                                        </span>
                                    </div>
                                    <div className="flex h-3 overflow-hidden rounded-sm bg-slate-100">
                                        <div
                                            className="bg-emerald-500"
                                            style={{ width: `${matchPct}%` }}
                                            title={`Match: ${formatMoneyShort(p.match)}`}
                                        />
                                        <div
                                            className="bg-sky-500"
                                            style={{ width: `${leveragedPct}%` }}
                                            title={`Leveraged: ${formatMoneyShort(p.leveraged)}`}
                                        />
                                        <div
                                            className="bg-slate-400"
                                            style={{ width: `${contractPct}%` }}
                                            title={`Contract: ${formatMoneyShort(p.contract)}`}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                        <li className="flex flex-wrap gap-3 pt-2 text-[11px] text-slate-500">
                            <Legend color="bg-emerald-500" label="Match" />
                            <Legend color="bg-sky-500" label="Leveraged" />
                            <Legend color="bg-slate-400" label="Contract" />
                        </li>
                    </ul>
                )}
            </SectionCard>

            <SectionCard
                title="Match & leveraged by investment area"
                description={
                    data
                        ? `Average match split: ${formatPct(data.totals.averageMatchSplit)}`
                        : ''
                }
            >
                {loading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !data?.byArea.length ? (
                    <EmptyState message="No data for the current filters." />
                ) : (
                    <ul className="space-y-2.5">
                        {data.byArea.map((a) => {
                            const total = a.match + a.leveraged;
                            return (
                                <li
                                    key={a.name}
                                    className="flex items-baseline justify-between gap-3 text-xs"
                                >
                                    <span className="truncate text-slate-700">{a.name}</span>
                                    <span className="font-medium text-slate-900">
                                        {formatMoneyShort(total)}
                                    </span>
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

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-3 rounded-sm ${color}`} />
            {label}
        </span>
    );
}
