// ─── components/project_details/finance/FinanceHistorySection.tsx ────
//
// Public, read-only quarterly finance history for the project detail page.
// Drop into the detail Finance tab:  <FinanceHistorySection projectId={projectId} />
//
// Data: /api/projectDetailPageRoutes/[id]/financeHistory (oldest first).
// ─── components/project_details/finance/FinanceHistorySection.tsx ────
//
// Public, read-only quarterly finance history for the project detail page.
// Drop into the detail Finance tab:  <FinanceHistorySection projectId={projectId} />


'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useProjectFinanceHistory, type PublicFinanceQuarter } from '../shared/useProjectData';
import { fmtC, fmtS, fmtPct2 } from '../shared/format';

// ─── Small helpers ────────────────────────────────────────────────────

const qLabel = (q: PublicFinanceQuarter) => `Q${q.reportingQuarter} ${q.reportingYear}`;
const qShort = (q: PublicFinanceQuarter) => `Q${q.reportingQuarter} ’${String(q.reportingYear).slice(2)}`;

function DeltaBadge({ curr, prev }: { curr: number | null; prev: number | null }) {
    if (curr == null || prev == null) return null;
    const diff = curr - prev;
    if (diff === 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                <Minus size={10} /> no change
            </span>
        );
    }
    const up = diff > 0;
    return (
        <span className={[
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            up ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
        ].join(' ')}>
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {up ? '+' : '−'}{fmtS(Math.abs(diff))}
        </span>
    );
}

// ─── The one chart: animated Funding Journey ──────────────────────────

const W = 760, H = 260;
const ML = 52, MR = 128, MT = 16, MB = 32;   // wide right margin: series end-labels live there

const drawIn = { duration: 1.1, ease: 'easeInOut' as const };

// Round the axis to human numbers ($250K, $500K…) instead of raw data fractions.
function niceScale(dataMax: number): { max: number; ticks: number[] } {
    if (dataMax <= 0) return { max: 1, ticks: [] };
    const rawStep = dataMax / 4;
    const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = ([1, 2, 2.5, 5, 10].find((m) => m * pow >= rawStep) ?? 10) * pow;
    const max = Math.ceil((dataMax * 1.02) / step) * step;
    const ticks: number[] = [];
    for (let v = step; v <= max + step / 2; v += step) ticks.push(v);
    return { max, ticks };
}

function FundingJourneyChart({ quarters }: { quarters: PublicFinanceQuarter[] }) {
    const [hover, setHover] = useState<number | null>(null);

    const n = quarters.length;
    const { max: maxVal, ticks } = useMemo(() => {
        let m = 0;
        for (const q of quarters) {
            m = Math.max(m, q.committedFunding ?? 0, q.encumberedFunding ?? 0, q.expendedToDate ?? 0);
        }
        return niceScale(m);
    }, [quarters]);

    const x = (i: number) => ML + (i / (n - 1)) * (W - ML - MR);
    const y = (v: number) => MT + (1 - v / maxVal) * (H - MT - MB);

    const line = (get: (q: PublicFinanceQuarter) => number | null) => {
        let d = '', started = false;
        quarters.forEach((q, i) => {
            const v = get(q);
            if (v == null) return;
            d += `${started ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
            started = true;
        });
        return d;
    };
    // Step-after path: budgets move in discrete steps, so the committed
    // ceiling is drawn as a staircase — visually unmistakable next to the
    // smooth encumbered/expended lines even when the values are close.
    const stepLine = (get: (q: PublicFinanceQuarter) => number | null) => {
        const pts = quarters
            .map((q, i) => ({ i, v: get(q) }))
            .filter((p): p is { i: number; v: number } => p.v != null);
        if (pts.length === 0) return '';
        let d = `M${x(pts[0].i).toFixed(1)},${y(pts[0].v).toFixed(1)}`;
        for (let k = 1; k < pts.length; k++) {
            d += `L${x(pts[k].i).toFixed(1)},${y(pts[k - 1].v).toFixed(1)}`;   // run
            d += `L${x(pts[k].i).toFixed(1)},${y(pts[k].v).toFixed(1)}`;       // rise
        }
        return d;
    };
    const area = (get: (q: PublicFinanceQuarter) => number | null) => {
        const pts = quarters
            .map((q, i) => ({ i, v: get(q) }))
            .filter((p): p is { i: number; v: number } => p.v != null);
        if (pts.length < 2) return '';
        return `M${x(pts[0].i).toFixed(1)},${y(pts[0].v).toFixed(1)}`
            + pts.slice(1).map((p) => `L${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join('')
            + `L${x(pts[pts.length - 1].i).toFixed(1)},${(H - MB).toFixed(1)}`
            + `L${x(pts[0].i).toFixed(1)},${(H - MB).toFixed(1)}Z`;
    };

    const committedLine = stepLine((q) => q.committedFunding);
    const hasCommitted = quarters.some((q) => q.committedFunding != null);
    const encumberedLine = line((q) => q.encumberedFunding);
    const encumberedArea = area((q) => q.encumberedFunding);
    const expendedLine = line((q) => q.expendedToDate);
    const expendedArea = area((q) => q.expendedToDate);

    const labelEvery = Math.max(1, Math.ceil(n / 8));
    // Always label the first and last quarters; thin the middle.
    const showXLabel = (i: number) => i === 0 || i === n - 1 || (n - 1 - i) % labelEvery === 0;
    const hovered = hover != null ? quarters[hover] : null;
    // Keep the tooltip inside the card near the edges.
    // const tooltipPct = hover != null ? Math.min(84, Math.max(14, (x(hover) / W) * 100)) : 0;

    // ── Direct end-labels (replace the legend): name + latest value at each
    //    line's end, nudged apart when they'd collide. ──
    const lastOf = (get: (q: PublicFinanceQuarter) => number | null) => {
        for (let i = n - 1; i >= 0; i--) {
            const v = get(quarters[i]);
            if (v != null) return { i, v };
        }
        return null;
    };
    const endLabels = useMemo(() => {
        const defs = [
            { name: 'Committed', color: '#d97706', pt: lastOf((q) => q.committedFunding) },
            { name: 'Encumbered', color: '#64748b', pt: lastOf((q) => q.encumberedFunding) },
            { name: 'Expended', color: '#0f172a', pt: lastOf((q) => q.expendedToDate) },
        ].filter((d): d is { name: string; color: string; pt: { i: number; v: number } } => d.pt != null)
            .map((d) => ({ ...d, y: y(d.pt.v) }))
            .sort((a, b) => a.y - b.y);
        for (let i = 1; i < defs.length; i++) {
            if (defs[i].y - defs[i - 1].y < 26) defs[i].y = defs[i - 1].y + 26;
        }
        return defs;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quarters, maxVal]);

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
                 aria-label="Funding journey: committed, encumbered, and expended funds by quarter">
                <defs>
                    <linearGradient id="fjExpended" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f172a" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="fjEncumbered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#64748b" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#64748b" stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* gridlines + $ labels — nice round ticks */}
                {ticks.map((v, gi) => (
                    <motion.g key={v}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ delay: 0.08 * gi, duration: 0.4 }}>
                        <line x1={ML} x2={W - MR} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 4" />
                        <text x={ML - 8} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{fmtS(v)}</text>
                    </motion.g>
                ))}
                <line x1={ML} x2={W - MR} y1={H - MB} y2={H - MB} stroke="#cbd5e1" strokeWidth="1" />

                {/* encumbered — middle band: money under contract */}
                {encumberedArea && (
                    <motion.path d={encumberedArea} fill="url(#fjEncumbered)"
                                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                 transition={{ delay: 0.5, duration: 0.7 }} />
                )}
                {encumberedLine && (
                    <motion.path d={encumberedLine} fill="none" stroke="#64748b" strokeWidth="1.75"
                                 strokeLinejoin="round"
                                 initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                 transition={{ ...drawIn, delay: 0.35 }} />
                )}

                {/* committed — amber stepped ceiling. Distinct hue + staircase
                    shape so it can never be confused with (or hidden behind)
                    the slate encumbered/expended lines.
                    NOTE: fade in, do NOT animate pathLength — motion implements
                    pathLength via stroke-dasharray, which destroys the dash
                    pattern (this is why the line used to be invisible). */}
                {committedLine && (
                    <>
                        <motion.path d={committedLine} fill="none" stroke="#d97706" strokeWidth="2"
                                     strokeDasharray="7 5" strokeLinecap="round" strokeOpacity="0.9"
                                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                     transition={{ duration: 0.8, delay: 0.15 }} />
                        {/* square markers pin the ceiling to each quarter */}
                        {quarters.map((q, i) => q.committedFunding != null && (
                            <motion.rect key={`cm-${i}`}
                                         x={x(i) - 3} y={y(q.committedFunding) - 3} width={6} height={6}
                                         rx={1} fill="#fff" stroke="#d97706" strokeWidth="1.5"
                                         initial={{ opacity: 0, scale: 0 }}
                                         animate={{ opacity: 1, scale: 1 }}
                                         transition={{ delay: 0.9 + i * 0.05, type: 'spring', stiffness: 400, damping: 22 }} />
                        ))}
                    </>
                )}
                {!hasCommitted && (
                    <text x={ML + 4} y={MT + 12} fontSize="10" fill="#b45309" fontStyle="italic">
                        Committed funding not recorded for these quarters
                    </text>
                )}

                {/* expended — the dark climb */}
                {expendedArea && (
                    <motion.path d={expendedArea} fill="url(#fjExpended)"
                                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                 transition={{ delay: 0.9, duration: 0.7 }} />
                )}
                {expendedLine && (
                    <motion.path d={expendedLine} fill="none" stroke="#0f172a" strokeWidth="2.5"
                                 strokeLinejoin="round"
                                 initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                 transition={{ ...drawIn, delay: 0.7 }} />
                )}

                {/* dots on expended + x labels */}
                {quarters.map((q, i) => (
                    <g key={i}>
                        {q.expendedToDate != null && (
                            <motion.circle cx={x(i)} cy={y(q.expendedToDate)}
                                           r={hover === i ? 5 : 3.5}
                                           fill="#0f172a" stroke="#fff" strokeWidth="1.5"
                                           initial={{ scale: 0, opacity: 0 }}
                                           animate={{ scale: 1, opacity: 1 }}
                                           transition={{ delay: 1.2 + i * 0.07, type: 'spring', stiffness: 400, damping: 20 }} />
                        )}
                        {showXLabel(i) && (
                            <motion.text x={x(i)} y={H - MB + 16} textAnchor="middle" fontSize="10"
                                         fill={hover === i ? '#0f172a' : '#94a3b8'}
                                         fontWeight={hover === i ? 700 : 400}
                                         initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                         transition={{ delay: 0.3 + i * 0.04 }}>
                                {qShort(q)}
                            </motion.text>
                        )}
                    </g>
                ))}

                {/* direct end-labels — series name + latest value, no legend needed */}
                {endLabels.map((l, li) => (
                    <motion.g key={l.name}
                              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.4 + li * 0.12, duration: 0.4, ease: 'easeOut' }}>
                        <line x1={x(l.pt.i) + 6} x2={W - MR + 14} y1={y(l.pt.v)} y2={l.y}
                              stroke={l.color} strokeWidth="1" strokeOpacity="0.35" />
                        <circle cx={W - MR + 14} cy={l.y} r={2.5} fill={l.color} />
                        <text x={W - MR + 21} y={l.y - 1} fontSize="10" fontWeight={700} fill={l.color}>
                            {l.name}
                        </text>
                        <text x={W - MR + 21} y={l.y + 11} fontSize="10" fill="#94a3b8"
                              fontFamily="ui-monospace, monospace">
                            {fmtS(l.pt.v)}
                        </text>
                    </motion.g>
                ))}

                {/* hover guideline + stage markers */}
                <AnimatePresence>
                    {hover != null && (
                        <motion.g key="guide"
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  transition={{ duration: 0.15 }}>
                            <line x1={x(hover)} x2={x(hover)} y1={MT} y2={H - MB}
                                  stroke="#0f172a" strokeWidth="1" strokeOpacity="0.25" />
                            {quarters[hover].committedFunding != null && (
                                <rect x={x(hover) - 4} y={y(quarters[hover].committedFunding as number) - 4}
                                      width={8} height={8} rx={1.5}
                                      fill="#d97706" stroke="#fff" strokeWidth="1.5" />
                            )}
                            {quarters[hover].encumberedFunding != null && (
                                <circle cx={x(hover)} cy={y(quarters[hover].encumberedFunding as number)} r={3.5}
                                        fill="#64748b" stroke="#fff" strokeWidth="1.5" />
                            )}
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* hover capture zones */}
                {quarters.map((_, i) => {
                    const left = i === 0 ? ML : (x(i - 1) + x(i)) / 2;
                    const right = i === n - 1 ? W - MR : (x(i) + x(i + 1)) / 2;
                    return (
                        <rect key={i} x={left} y={MT} width={Math.max(right - left, 1)} height={H - MT - MB}
                              fill="transparent"
                              onMouseEnter={() => setHover(i)}
                              onMouseLeave={() => setHover(null)} />
                    );
                })}
            </svg>

            {/* tooltip — the FULL quarter record */}
            <AnimatePresence>
                {hovered && hover != null && (
                    <motion.div
                        key={hover}
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        className="pointer-events-none absolute top-0 z-10 w-52 -translate-x-1/2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur"
                        style={{ left: `${(x(hover) / W) * 100}%` }}
                    >
                        <p className="text-[11px] font-bold text-slate-900">
                            {qLabel(hovered)}
                            {hovered.source === 'current' && (
                                <span className="ml-1.5 rounded bg-slate-200 px-1 py-px text-[9px] font-bold uppercase tracking-wider text-slate-600">Current</span>
                            )}
                        </p>
                        <div className="mt-1.5 space-y-0.5 text-[11px]">
                            {([
                                ['Committed', fmtC(hovered.committedFunding), 'amber'],
                                ['Encumbered', fmtC(hovered.encumberedFunding), 'normal'],
                                ['Expended', fmtC(hovered.expendedToDate), 'strong'],
                                ['Match funding', fmtC(hovered.matchFunding), 'normal'],
                                ['Leveraged', fmtC(hovered.leveragedFunds), 'normal'],
                                ['Match split', fmtPct2(hovered.matchFundingSplit), 'normal'],
                            ] as [string, string, 'amber' | 'strong' | 'normal'][]).map(([l, v, tone]) => (
                                <p key={l} className="flex justify-between gap-3 text-slate-500">
                                    <span>{l}</span>
                                    <span className={[
                                        'font-mono tabular-nums',
                                        tone === 'strong' ? 'font-semibold text-slate-900'
                                            : tone === 'amber' ? 'font-semibold text-amber-600'
                                                : 'text-slate-700',
                                    ].join(' ')}>{v}</span>
                                </p>
                            ))}
                            {hovered.committedFunding != null && hovered.expendedToDate != null && (
                                <p className="mt-1 flex justify-between gap-3 border-t border-slate-100 pt-1 text-slate-400">
                                    <span>Headroom left</span>
                                    <span className="font-mono tabular-nums text-slate-600">
                                        {fmtC(hovered.committedFunding - hovered.expendedToDate)}
                                    </span>
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No bottom legend — the direct end-labels on each line make it
                redundant. Bidder/contract fields intentionally live in their
                own section (see BiddingSection below), not in this chart or
                its tooltip. */}
        </div>
    );
}

// ─── Utilization gauge (inside the stat-chip row) ─────────────────────

function UtilizationGauge({ ratio }: { ratio: number | null }) {
    const valid = ratio != null && Number.isFinite(ratio) && ratio >= 0;
    const frac = valid ? Math.min(ratio as number, 1) : 0;   // arc caps at 100%
    const over = valid && (ratio as number) > 1;             // text shows the real value

    const SEMI = 'M8,38 A30,30 0 0 1 68,38';

    return (
        <div className="flex items-end gap-3">
            <svg width="76" height="44" viewBox="0 0 76 44" aria-hidden="true">
                <path d={SEMI} fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
                {valid && frac > 0.01 && (
                    <motion.path
                        d={SEMI} fill="none"
                        stroke={over ? '#d97706' : '#0f172a'}
                        strokeWidth="7" strokeLinecap="round"
                        pathLength={1} strokeDasharray="1 1"
                        initial={{ strokeDashoffset: 1 }}
                        animate={{ strokeDashoffset: 1 - frac }}
                        transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }} />
                )}
            </svg>
            <div className="flex flex-col">
                <span className={[
                    'font-mono text-lg font-semibold tabular-nums leading-none',
                    over ? 'text-amber-600' : 'text-slate-900',
                ].join(' ')}>
                    {valid ? `${((ratio as number) * 100).toFixed(1)}%` : '—'}
                </span>
                {over && (
                    <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-600">
                        over committed
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Narrative + stats ────────────────────────────────────────────────

function buildNarrative(quarters: PublicFinanceQuarter[]): string | null {
    const withExp = quarters.filter((q) => q.expendedToDate != null);
    if (withExp.length < 2) return null;
    const first = withExp[0];
    const last = withExp[withExp.length - 1];
    const util = last.committedFunding && last.committedFunding > 0 && last.expendedToDate != null
        ? last.expendedToDate / last.committedFunding
        : null;
    let s = `Between ${qLabel(first)} and ${qLabel(last)}, funds expended grew from ${fmtS(first.expendedToDate ?? 0)} to ${fmtS(last.expendedToDate ?? 0)}`;
    if (util != null) s += ` — ${(util * 100).toFixed(0)}% of committed funding put to work`;
    return s + '.';
}

function StatChip({ label, value, sub, delay = 0 }: {
    label: string; value?: string; sub?: React.ReactNode; delay?: number;
}) {
    return (
        <motion.div
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
        >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            {value != null && (
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">{value}</p>
            )}
            {sub && <div className="mt-1">{sub}</div>}
        </motion.div>
    );
}

// ─── Bidding & contract details ────────────────────────────────────────
//
// Bidder info is set once for the contract and doesn't change quarter to
// quarter, so — unlike everything else in this file — it's NOT rendered
// per-quarter. Just a minimal text block: whichever record has the data
// (most recent first), no table, no card, no "Current" badge.

function BiddingSection({ quarters }: { quarters: PublicFinanceQuarter[] }) {
    const record = [...quarters].reverse().find(
        (q) => q.numOfBidders != null || q.rankOfSelectedBidders != null || q.bidderDescription,
    );
    if (!record) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.4, ease: 'easeOut' }}
        >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Bidding &amp; Contract
            </p>
            <p className="mt-2 text-sm text-slate-600">
                {record.numOfBidders != null && (
                    <>Number of bidders <span className="font-semibold text-slate-800">{record.numOfBidders}</span></>
                )}
                {record.numOfBidders != null && record.rankOfSelectedBidders != null && (
                    <span className="mx-2 text-slate-300">·</span>
                )}
                {record.rankOfSelectedBidders != null && (
                    <>Selected bidder rank <span className="font-semibold text-slate-800">{record.rankOfSelectedBidders}</span></>
                )}
            </p>
            {record.bidderDescription && (
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{record.bidderDescription}</p>
            )}
        </motion.div>
    );
}

// ─── Main section ─────────────────────────────────────────────────────

export function FinanceHistorySection({ projectId }: { projectId: number | string }) {
    const state = useProjectFinanceHistory(projectId);

    if (state.status === 'loading') {
        return (
            <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2 text-sm">Loading finance history…</span>
            </div>
        );
    }
    if (state.status === 'error') {
        return <p className="py-8 text-sm italic text-slate-400">Finance history is unavailable for this project.</p>;
    }

    const quarters = state.data.quarters;   // oldest first
    if (quarters.length === 0) {
        return <p className="py-8 text-sm italic text-slate-400">No quarterly finance records yet.</p>;
    }

    const newestFirst = [...quarters].reverse();
    const latest = newestFirst[0];
    const prev = newestFirst[1] ?? null;
    const narrative = buildNarrative(quarters);
    const utilization = latest.committedFunding && latest.committedFunding > 0 && latest.expendedToDate != null
        ? latest.expendedToDate / latest.committedFunding
        : null;

    return (
        <section className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Funding Journey
                </h2>
                {narrative && (
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">{narrative}</p>
                )}
            </motion.div>

            {/* Stat chips */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatChip delay={0.05} label="Committed" value={fmtC(latest.committedFunding)}
                          sub={<DeltaBadge curr={latest.committedFunding} prev={prev?.committedFunding ?? null} />} />
                <StatChip delay={0.12} label="Expended to date" value={fmtC(latest.expendedToDate)}
                          sub={<DeltaBadge curr={latest.expendedToDate} prev={prev?.expendedToDate ?? null} />} />
                <StatChip delay={0.19} label="Funds utilized"
                          sub={
                              <div className="mt-1 space-y-1">
                                  <UtilizationGauge ratio={utilization} />
                                  <span className="block text-[10px] text-slate-400">expended ÷ committed</span>
                              </div>
                          } />
                <StatChip delay={0.26} label="Match split" value={fmtPct2(latest.matchFundingSplit)}
                          sub={<span className="text-[10px] text-slate-400">as of {qLabel(latest)}</span>} />
            </div>

            {/* Contract amount / leveraged funds — plain text, not chips */}
            {(latest.contractAmount != null || latest.leveragedFunds != null) && (
                <p className="-mt-4 text-xs text-slate-500">
                    {latest.contractAmount != null && (
                        <>Contract amount <span className="font-mono font-semibold text-slate-700">{fmtC(latest.contractAmount)}</span></>
                    )}
                    {latest.contractAmount != null && latest.leveragedFunds != null && (
                        <span className="mx-2 text-slate-300">·</span>
                    )}
                    {latest.leveragedFunds != null && (
                        <>Leveraged funds <span className="font-mono font-semibold text-slate-700">{fmtC(latest.leveragedFunds)}</span></>
                    )}
                </p>
            )}

            {/* Quarter list — newest first, before the graph */}
            <motion.div
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45, ease: 'easeOut' }}
            >
                <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Quarterly records
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            {['Quarter', 'Committed', 'Encumbered', 'Expended', 'QoQ change', 'Match %'].map((h, i) => (
                                <th key={h} className={[
                                    'px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400',
                                    i === 0 ? 'text-left' : 'text-right',
                                ].join(' ')}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {newestFirst.map((q, i) => {
                            const older = newestFirst[i + 1] ?? null;
                            return (
                                <motion.tr key={`${q.reportingYear}-${q.reportingQuarter}`}
                                           className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                                           initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                           transition={{ delay: 0.25 + i * 0.05, duration: 0.35, ease: 'easeOut' }}>
                                    <td className="px-5 py-3">
                                        <span className="font-semibold tabular-nums text-slate-800">{qLabel(q)}</span>
                                        {q.source === 'current' && (
                                            <span className="ml-2 rounded bg-slate-200 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-slate-600">
                                                    Current
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-slate-600">{fmtC(q.committedFunding)}</td>
                                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-slate-600">{fmtC(q.encumberedFunding)}</td>
                                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums font-semibold text-slate-900">{fmtC(q.expendedToDate)}</td>
                                    <td className="px-5 py-3 text-right">
                                        <DeltaBadge curr={q.expendedToDate} prev={older?.expendedToDate ?? null} />
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-slate-600">{fmtPct2(q.matchFundingSplit)}</td>
                                </motion.tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* The one graph — underneath the list */}
            {quarters.length >= 2 ? (
                <motion.div
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.45, ease: 'easeOut' }}
                >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Funding journey
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Money moving through stages — the <span className="font-semibold text-amber-600">committed ceiling</span> (stepped),
                        encumbered (under contract), and expended. Hover a quarter for the full record.
                    </p>
                    <div className="mt-4">
                        <FundingJourneyChart quarters={quarters} />
                    </div>
                </motion.div>
            ) : (
                <p className="text-xs italic text-slate-400">
                    {/*The funding journey chart will appear once a second quarterly record is added.*/}
                </p>
            )}

            {/* Bidding & contract details — now placed at the very bottom,
                below the graph. */}
            <BiddingSection quarters={quarters} />
        </section>
    );
}