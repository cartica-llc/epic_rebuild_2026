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
            <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">Match funding</span> is the amount
                a recipient or partner organization contributes to unlock program dollars.{' '}
                <span className="font-medium text-slate-700">Leveraged funds</span> are additional
                outside funding brought in alongside the award, beyond what was required as
                match. Together, they show how much non-program money each award attracts on top
                of the contract amount.
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card
                    label="Match Funding"
                    value={formatMoneyShort(data?.totals.matchFunding ?? 0)}
                    loading={loading}
                    hint="Funding contributed by the recipient or partner organization to match program dollars."
                />
                <Card
                    label="Leveraged Funds"
                    value={formatMoneyShort(data?.totals.leveragedFunds ?? 0)}
                    loading={loading}
                    hint="Additional outside funding brought in alongside the award, beyond the required match."
                />
                <Card
                    label="Contract Amount"
                    value={formatMoneyShort(data?.totals.contractAmount ?? 0)}
                    loading={loading}
                    hint="Total contracted award amount for the filtered projects."
                />
                <Card
                    label="Leverage Ratio"
                    value={
                        data
                            ? `${(data.totals.ratio * 100).toFixed(0)}%`
                            : '0%'
                    }
                    loading={loading}
                    hint="Combined match and leveraged funds as a share of the contract amount — shows how much additional funding each program dollar attracted."
                />
            </div>

            <SectionCard
                title="Match & leveraged funds by period"
                description="For each period, the bar splits contract amount into match funding, leveraged funds, and remaining contract dollars."
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
                                            className="bg-emerald-400"
                                            style={{ width: `${matchPct}%` }}
                                            title={`Match: ${formatMoneyShort(p.match)}`}
                                        />
                                        <div
                                            className="bg-emerald-700"
                                            style={{ width: `${leveragedPct}%` }}
                                            title={`Leveraged: ${formatMoneyShort(p.leveraged)}`}
                                        />
                                        <div
                                            className="bg-slate-300"
                                            style={{ width: `${contractPct}%` }}
                                            title={`Contract: ${formatMoneyShort(p.contract)}`}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                        <li className="flex flex-wrap gap-3 pt-2 text-[11px] text-slate-500">
                            <Legend color="bg-emerald-400" label="Match" />
                            <Legend color="bg-emerald-700" label="Leveraged" />
                            <Legend color="bg-slate-300" label="Contract" />
                        </li>
                    </ul>
                )}
            </SectionCard>

            <SectionCard
                title="Match & leveraged by investment area"
                description={
                    data
                        ? `Combined match and leveraged funds per investment area. Average match split across filtered projects: ${formatPct(data.totals.averageMatchSplit)}.`
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

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-3 rounded-sm ${color}`} />
            {label}
        </span>
    );
}