// ─── components/project_forms/StageProgressBar.tsx ───────────────────
// Horizontal stage progress bar with per-stage completion rings.

'use client';

import { useMemo, useState } from 'react';
import type { ProjectFormData } from './types';
import { computeStageProgress, type StageProgress } from './stageRequirements';

// ─── Stage color palette ─────────────────────────────────────────────

const STAGE_COLORS: Record<string, { ring: string; bar: string; bg: string; border: string; text: string }> = {
    Entry:    { ring: '#6366f1', bar: '#6366f1', bg: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700' },
    Active:   { ring: '#f59e0b', bar: '#f59e0b', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700' },
    Closeout: { ring: '#8b5cf6', bar: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
};

const COMPLETE_COLOR = '#0d9488';  // teal-600

// ─── Mini ring SVG ───────────────────────────────────────────────────

function ProgressRing({ percent, stageColor, size = 36, stroke = 3 }: {
    percent: number; stageColor: string; size?: number; stroke?: number;
}) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    const color = percent === 100 ? COMPLETE_COLOR : stageColor;

    return (
        <svg width={size} height={size} className="shrink-0 -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    className="transition-all duration-500 ease-out" />
        </svg>
    );
}

// ─── Cadence badge ───────────────────────────────────────────────────

const CADENCE_STYLES: Record<string, string> = {
    once: 'bg-blue-50 text-blue-600 border-blue-200',
    annual: 'bg-amber-50 text-amber-600 border-amber-200',
    quarterly: 'bg-violet-50 text-violet-600 border-violet-200',
    'if-needed': 'bg-slate-50 text-slate-500 border-slate-200',
};

const CADENCE_LABELS: Record<string, string> = {
    once: 'Once',
    annual: 'Annual',
    quarterly: 'Quarterly',
    'if-needed': 'As needed',
};

// ─── Main component ─────────────────────────────────────────────────

export function StageProgressBar({ data, onOpenInfo }: {
    data: ProjectFormData;
    onOpenInfo: () => void;
}) {
    const progress = useMemo(() => computeStageProgress(data), [data]);
    const totalFields = progress.reduce((a, s) => a + s.total, 0);
    const totalFilled = progress.reduce((a, s) => a + s.filled, 0);
    const overallPercent = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

    const [expanded, setExpanded] = useState<string | null>(null);

    // Build a segmented bar from each stage's color, proportional to filled fields
    const barSegments = progress.map((s) => {
        const colors = STAGE_COLORS[s.stage] ?? STAGE_COLORS.Entry;
        const widthPct = totalFields > 0 ? (s.filled / totalFields) * 100 : 0;
        return { color: s.percent === 100 ? COMPLETE_COLOR : colors.bar, widthPct };
    });

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {/* ── Header ── */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3 py-2">
                    <ProgressRing percent={overallPercent} stageColor="#6366f1" size={32} stroke={3} />
                    <div>
                        <span className="text-sm font-semibold text-slate-900">{overallPercent}% Complete</span>
                        <span className="text-xs text-slate-400 ml-2">{totalFilled}/{totalFields} fields</span>
                    </div>
                </div>
                <button type="button" onClick={onOpenInfo}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors rounded-lg border border-slate-200 px-2.5 py-1.5 hover:bg-indigo-50 hover:border-indigo-200">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 7v4M8 5.5v-.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Stage Guide
                </button>
            </div>

            {/* ── Overall segmented bar ── */}
            <div className="px-5 pt-3 pb-1">
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    {barSegments.map((seg, i) => (
                        <div key={i} className="h-full transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full"
                             style={{ width: `${seg.widthPct}%`, backgroundColor: seg.color }} />
                    ))}
                </div>
            </div>

            {/* ── Stage segments ── */}
            <div className="px-5 py-3 flex gap-2">
                {progress.map((s) => (
                    <StageSegment key={s.stage} stage={s} expanded={expanded === s.stage}
                                  onToggle={() => setExpanded(expanded === s.stage ? null : s.stage)} />
                ))}
            </div>

            {/* ── Expanded field list ── */}
            {expanded && (
                <ExpandedStageFields stage={progress.find((s) => s.stage === expanded)!} />
            )}
        </div>
    );
}

// ─── Stage segment button ────────────────────────────────────────────

function StageSegment({ stage, expanded, onToggle }: {
    stage: StageProgress; expanded: boolean; onToggle: () => void;
}) {
    const isComplete = stage.percent === 100;
    const colors = STAGE_COLORS[stage.stage] ?? STAGE_COLORS.Entry;

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-left transition-all
                ${expanded
                ? `${colors.border} ${colors.bg}`
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'}`}
        >
            <div className="flex items-center gap-2.5">
                <ProgressRing percent={stage.percent} stageColor={colors.ring} size={28} stroke={2.5} />
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold ${expanded ? colors.text : 'text-slate-800'}`}>{stage.stage}</span>
                        {isComplete && (
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-teal-500 shrink-0">
                                <circle cx="8" cy="8" r="7" fill="currentColor" />
                                <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-400">{stage.filled}/{stage.total}</span>
                </div>
            </div>
        </button>
    );
}

// ─── Expanded field checklist ────────────────────────────────────────

function ExpandedStageFields({ stage }: { stage: StageProgress }) {
    return (
        <div className="border-t border-slate-100 px-5 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {stage.fields.map((f) => (
                    <div key={f.key} className="flex items-center gap-2 py-1">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors
                            ${f.filled ? 'bg-teal-500' : 'border-2 border-slate-300'}`}>
                            {f.filled && (
                                <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className={`text-xs leading-snug ${f.filled ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {f.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { CADENCE_STYLES, CADENCE_LABELS, STAGE_COLORS, COMPLETE_COLOR };