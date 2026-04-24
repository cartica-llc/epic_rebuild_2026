'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { AnalyticsContext } from '../types';

const MORT = [
    'Near-market',
    'Validation',
    'Development',
    'Demonstration / Build',
    'Early R&D',
    'Unstaged',
];

const MF: Record<string, string> = {
    'Near-market': '#0f172a',
    Validation: '#334155',
    Development: '#64748b',
    'Demonstration / Build': '#cbd5e1',
    'Early R&D': '#e2e8f0',
    Unstaged: '#f1f5f9',
};

const TTS: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #e7e5e4',
    borderRadius: 12,
    padding: '10px 14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
};

type Props = {
    commercialization: NonNullable<AnalyticsContext['commercialization']>;
    maturityCounts: Record<string, number>;
    sameStageSignalCounts: AnalyticsContext['sameStageSignalCounts'];
};

export function CommPanel({
    commercialization: m,
    maturityCounts,
    sameStageSignalCounts,
}: Props) {
    const same = sameStageSignalCounts;
    const totalPortfolio = Object.values(maturityCounts).reduce((a, b) => a + b, 0);

    const segments = [
        {
            band: 'Strong' as const,
            count: same.strong,
            pct: same.total > 0 ? (same.strong / same.total) * 100 : 0,
            fill: '#0f172a',
            labelColor: '#f8fafc',
        },
        {
            band: 'Emerging' as const,
            count: same.emerging,
            pct: same.total > 0 ? (same.emerging / same.total) * 100 : 0,
            fill: '#0ea5e9',
            labelColor: '#f8fafc',
        },
        {
            band: 'Early' as const,
            count: same.early,
            pct: same.total > 0 ? (same.early / same.total) * 100 : 0,
            fill: '#cbd5e1',
            labelColor: '#0f172a',
        },
    ].filter((s) => s.pct > 0);

    const counts = MORT.map((stage) => ({
        stage,
        count: maturityCounts[stage] ?? 0,
        active: m.maturity === stage,
    }));

    const bandFill =
        m.signalBand === 'Strong'
            ? '#0f172a'
            : m.signalBand === 'Emerging'
            ? '#0ea5e9'
            : '#cbd5e1';
    const bandText = m.signalBand === 'Early' ? '#0f172a' : '#f8fafc';

    const stageShare =
        totalPortfolio > 0 ? (same.total / totalPortfolio) * 100 : 0;

    const thisBandCount =
        m.signalBand === 'Strong'
            ? same.strong
            : m.signalBand === 'Emerging'
            ? same.emerging
            : same.early;

    const bandLegend = [
        { l: 'Strong (4–5)', f: '#0f172a' },
        { l: 'Emerging (2–3)', f: '#0ea5e9' },
        { l: 'Early (0–1)', f: '#cbd5e1' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-end gap-1">
                    <span className="text-5xl font-bold leading-none tabular-nums text-slate-900">
                        {m.signalScore}
                    </span>
                    <span className="mb-1 text-xl font-semibold text-slate-300">/5</span>
                </div>
                <span
                    className="rounded-full px-4 py-1.5 text-sm font-bold"
                    style={{ backgroundColor: bandFill, color: bandText }}
                >
                    {m.signalBand} signal
                </span>
                {m.maturity === 'Near-market' && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 ring-2 ring-emerald-300">
                        ✦ Near-market
                    </span>
                )}
                <div className="ml-auto flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-3 w-3 rounded-full transition-all"
                            style={{
                                backgroundColor: i < m.signalScore ? bandFill : '#e2e8f0',
                                transform: i < m.signalScore ? 'scale(1)' : 'scale(0.75)',
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-baseline justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Maturity Stage
                        </p>
                        <p className="mt-0.5 text-lg font-bold text-slate-900">
                            {m.maturity}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Peers at stage
                        </p>
                        <p className="mt-0.5 text-lg font-bold text-slate-900">
                            {same.total}{' '}
                            <span className="text-xs font-normal text-slate-400">
                                ({stageShare.toFixed(0)}% of portfolio)
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <div className="mb-2 flex items-baseline justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Signal mix at {m.maturity}
                    </p>
                    <p className="text-[10px] text-slate-400">{same.total} projects</p>
                </div>

                <div className="mb-2.5 flex flex-wrap gap-4 text-[11px] text-slate-500">
                    {bandLegend.map(({ l, f }) => (
                        <span key={l} className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: f }}
                            />
                            {l}
                            {l.startsWith(m.signalBand) && (
                                <span className="font-bold text-slate-900">
                                    ← this project
                                </span>
                            )}
                        </span>
                    ))}
                </div>

                {same.total > 0 ? (
                    <div className="flex w-full" style={{ gap: 2 }}>
                        {segments.map((seg, i) => {
                            const isFirst = i === 0;
                            const isLast = i === segments.length - 1;
                            const isThis = seg.band === m.signalBand;
                            return (
                                <div
                                    key={seg.band}
                                    className="relative flex items-center justify-center transition-all"
                                    style={{
                                        width: `${seg.pct}%`,
                                        height: 36,
                                        backgroundColor: seg.fill,
                                        borderRadius:
                                            isFirst && isLast
                                                ? 8
                                                : isFirst
                                                ? '8px 0 0 8px'
                                                : isLast
                                                ? '0 8px 8px 0'
                                                : 0,
                                        boxShadow: isThis
                                            ? `0 0 0 2.5px #fff, 0 0 0 4.5px ${seg.fill}`
                                            : 'none',
                                        zIndex: isThis ? 1 : 0,
                                    }}
                                >
                                    {seg.pct >= 12 && (
                                        <span
                                            style={{
                                                color: seg.labelColor,
                                                fontSize: 11,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {Math.round(seg.pct)}%{isThis ? ' ★' : ''}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex h-9 items-center justify-center rounded-lg border border-dashed border-slate-200">
                        <span className="text-xs text-slate-400">
                            No peers at this stage
                        </span>
                    </div>
                )}

                <p className="mt-2 text-[11px] text-slate-500">
                    At <span className="font-semibold text-slate-700">{m.maturity}</span>:
                    {same.strong > 0 && (
                        <>
                            {' '}
                            <span className="font-semibold text-slate-900">
                                {same.strong}
                            </span>{' '}
                            strong,
                        </>
                    )}
                    {same.emerging > 0 && (
                        <>
                            {' '}
                            <span className="font-semibold text-slate-900">
                                {same.emerging}
                            </span>{' '}
                            emerging,
                        </>
                    )}
                    {same.early > 0 && (
                        <>
                            {' '}
                            <span className="font-semibold text-slate-900">
                                {same.early}
                            </span>{' '}
                            early
                        </>
                    )}{' '}
                    — this project is in the{' '}
                    <span className="font-semibold text-slate-900">{m.signalBand}</span>{' '}
                    tier ({thisBandCount} of {same.total}).
                </p>
            </div>

            <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Portfolio maturity pipeline
                </p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                        data={counts}
                        layout="vertical"
                        margin={{ left: 8, right: 20, top: 2, bottom: 2 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            type="number"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            dataKey="stage"
                            type="category"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            width={140}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={TTS}
                            formatter={(v) => [v as number, 'Projects']}
                        />
                        <Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={18}>
                            {counts.map((e, i) => (
                                <Cell
                                    key={i}
                                    fill={e.active ? '#0ea5e9' : MF[e.stage] ?? '#e2e8f0'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <p className="mt-1 text-[11px] text-slate-400">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-500 align-middle" />
                    Blue = this project&apos;s stage ({m.maturity})
                </p>
            </div>
        </div>
    );
}
