// components/dashboard/compliance/ComprehensivenessSummary.tsx
'use client';

import React from 'react';

import {
    scoreDistribution,
    summarizeByCluster,
    summarizeByField,
    type ClusterName,
    type FieldScore,
} from './comprehensivenessRubric';
import { Section } from './uiPrimitives';

// Mirrors the report's cluster ordering (Foundation -> Policy -> Innovation -> Impacts),
// which is also roughly strongest-to-weakest in the 2026 results.
const CLUSTER_ORDER: ClusterName[] = ['Foundation / Status', 'Policy / Barriers', 'Innovation / Scaling', 'Impacts / Metrics'];

const SCORE_COLORS: Record<number, string> = {
    0: 'bg-rose-400',
    1: 'bg-rose-300',
    2: 'bg-amber-300',
    3: 'bg-amber-400',
    4: 'bg-teal-400',
    5: 'bg-teal-500',
};

function scoreColorClass(score: number): string {
    if (score >= 4) return 'bg-teal-500';
    if (score >= 3) return 'bg-amber-400';
    if (score >= 2) return 'bg-amber-300';
    return 'bg-rose-400';
}

// Compact cluster row: name, average, and a one-line count. The low/high
// split moved into the tooltip instead of always-on text — it's useful but
// secondary, and having it on-screen for all four clusters was adding up.
function ClusterBar({ cluster, avgScore, scoredCount, lowPct, highPct }: { cluster: ClusterName; avgScore: number; scoredCount: number; lowPct: number; highPct: number }) {
    const pct = (avgScore / 5) * 100;
    return (
        <div title={`${lowPct}% low (0-2) · ${highPct}% high (4-5)`}>
            <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-medium text-slate-700">{cluster}</span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                    {avgScore.toFixed(2)} <span className="text-slate-400">/ 5</span>
                    <span className="ml-2 text-[10px] text-slate-400">{scoredCount.toLocaleString()} scored</span>
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${scoreColorClass(avgScore)}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

// Fixed-pixel bar track (TRACK_HEIGHT), not a flex-1 auto-height wrapper —
// percentage heights only resolve against a definite height, and the
// previous flex-1-inside-items-end layout had no definite height anywhere
// in the chain, so every bar silently rendered at 0px.
const TRACK_HEIGHT = 72;

function DistributionHistogram({ buckets }: { buckets: { score: number; count: number; pct: number }[] }) {
    const max = Math.max(1, ...buckets.map((b) => b.pct));
    return (
        <div className="flex items-end gap-2" style={{ height: TRACK_HEIGHT + 34 }}>
            {buckets.map((b) => (
                <div key={b.score} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-slate-500">{b.pct}%</span>
                    <div className="flex w-full items-end" style={{ height: TRACK_HEIGHT }}>
                        <div
                            className={`w-full rounded-t ${SCORE_COLORS[b.score]}`}
                            style={{ height: `${Math.max(4, (b.pct / max) * 100)}%` }}
                            title={`Score ${b.score}: ${b.count.toLocaleString()} entries (${b.pct}%)`}
                        />
                    </div>
                    <span className="text-[10px] text-slate-400">{b.score}</span>
                </div>
            ))}
        </div>
    );
}

export function ComprehensivenessSummary({ allScores }: { allScores: FieldScore[] }) {
    const clusters = React.useMemo(() => {
        const summary = summarizeByCluster(allScores);
        return CLUSTER_ORDER.map((c) => summary.find((s) => s.cluster === c)!);
    }, [allScores]);

    const distribution = React.useMemo(() => scoreDistribution(allScores), [allScores]);

    const fieldRanking = React.useMemo(() => {
        const fields = summarizeByField(allScores).filter((f) => f.scoredCount > 0);
        return [...fields].sort((a, b) => a.avgScore - b.avgScore).slice(0, 3);
    }, [allScores]);

    const scoredTotal = allScores.filter((s) => s.coverage).length;
    const overallAvg = scoredTotal
        ? Math.round((allScores.filter((s) => s.coverage).reduce((sum, s) => sum + s.score, 0) / scoredTotal) * 100) / 100
        : 0;

    // Collapsed by default: the distribution histogram is genuinely secondary
    // to the four cluster averages, which fit in a glance. Clicking through
    // to per-field detail is a deliberate choice, not the default view.
    const [showDistribution, setShowDistribution] = React.useState(false);

    if (allScores.length === 0) {
        return null;
    }

    return (
        <Section
            title="Comprehensiveness (Appendix B rubric)"
            description={`${scoredTotal.toLocaleString()} scored entries across 21 fields · portfolio average ${overallAvg.toFixed(2)} / 5`}
        >
            <div className="space-y-2.5">
                {clusters.map((c) => (
                    <ClusterBar key={c.cluster} cluster={c.cluster} avgScore={c.avgScore} scoredCount={c.scoredCount} lowPct={c.lowPct} highPct={c.highPct} />
                ))}
            </div>

            <button
                type="button"
                onClick={() => setShowDistribution((v) => !v)}
                className="mt-4 flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
                {showDistribution ? 'Hide' : 'Show'} score distribution &amp; lowest-scoring fields
            </button>

            {showDistribution && (
                <div className="mt-4 grid grid-cols-1 gap-8 border-t border-slate-100 pt-4 lg:grid-cols-2">
                    <div>
                        <h5 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Portfolio-wide score distribution</h5>
                        <DistributionHistogram buckets={distribution} />
                    </div>

                    {fieldRanking.length > 0 && (
                        <div>
                            <h5 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Lowest-scoring fields (remediation priority)
                            </h5>
                            <ul className="space-y-2">
                                {fieldRanking.map((f) => (
                                    <li key={f.key} className="flex items-center gap-3 text-xs">
                                        <span className="w-40 shrink-0 truncate text-slate-700">{f.label}</span>
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                            <div className={`h-full rounded-full ${scoreColorClass(f.avgScore)}`} style={{ width: `${(f.avgScore / 5) * 100}%` }} />
                                        </div>
                                        <span className="w-16 shrink-0 text-right font-mono tabular-nums text-slate-500">
                                            {f.avgScore.toFixed(2)} / 5
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Section>
    );
}