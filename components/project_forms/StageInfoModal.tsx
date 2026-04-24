// ─── components/project_forms/StageInfoModal.tsx ─────────────────────
// Full info modal showing all stages, their fields, descriptions,
// cadence badges, and completion status.

'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ProjectFormData } from './types';
import { STAGE_REQUIREMENTS, isStageFieldFilled, computeStageProgress } from './stageRequirements';
import { CADENCE_STYLES, CADENCE_LABELS, STAGE_COLORS, COMPLETE_COLOR } from './StageProgressBar';

// ─── Cadence legend items ────────────────────────────────────────────

const CADENCE_LEGEND: { key: string; label: string; desc: string }[] = [
    { key: 'once', label: 'Once', desc: 'Entered once and not expected to change.' },
    { key: 'annual', label: 'Annual', desc: 'Reviewed and updated at least once per year.' },
    { key: 'quarterly', label: 'Quarterly', desc: 'Updated every quarter during active period.' },
    { key: 'if-needed', label: 'As needed', desc: 'Updated whenever circumstances change.' },
];

// ─── Main modal ──────────────────────────────────────────────────────

export function StageInfoModal({ isOpen, onClose, data }: {
    isOpen: boolean;
    onClose: () => void;
    data: ProjectFormData;
}) {
    const [activeStage, setActiveStage] = useState(0);
    const progress = useMemo(() => computeStageProgress(data), [data]);

    if (!isOpen || typeof document === 'undefined') return null;

    const currentStage = STAGE_REQUIREMENTS[activeStage];
    const currentProgress = progress[activeStage];
    const colors = STAGE_COLORS[currentStage.stage] ?? STAGE_COLORS.Entry;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            {/* Fixed-height modal: 600px on desktop, capped at 90vh on small screens */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 h-[600px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* ── Header ── */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Reporting Stage Guide</h3>
                            <p className="text-xs text-slate-500">Field requirements by project lifecycle stage</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* ── Stage tabs ── */}
                <div className="px-6 pt-4 pb-0 shrink-0">
                    <div className="flex gap-2">
                        {STAGE_REQUIREMENTS.map((s, i) => {
                            const p = progress[i];
                            const isActive = i === activeStage;
                            const sc = STAGE_COLORS[s.stage] ?? STAGE_COLORS.Entry;
                            return (
                                <button key={s.stage} type="button" onClick={() => setActiveStage(i)}
                                        className={`flex-1 rounded-lg border px-3 py-2.5 text-left transition-all
                                            ${isActive
                                            ? `${sc.border} ${sc.bg}`
                                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-semibold ${isActive ? sc.text : 'text-slate-700'}`}>{s.stage}</span>
                                        <span className={`text-[10px] font-medium ${isActive ? sc.text : 'text-slate-400'}`}>
                                            {p.filled}/{p.total}
                                        </span>
                                    </div>
                                    {/* Mini bar */}
                                    <div className={`mt-1.5 h-1 w-full rounded-full ${isActive ? 'bg-white/60' : 'bg-slate-100'}`}>
                                        <div className="h-full rounded-full transition-all duration-300"
                                             style={{
                                                 width: `${p.percent}%`,
                                                 backgroundColor: p.percent === 100 ? COMPLETE_COLOR : sc.ring,
                                             }} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Stage description ── */}
                <div className="px-6 pt-3 pb-2 shrink-0">
                    <div className={`flex items-center gap-2 rounded-lg ${colors.bg} border ${colors.border} px-3 py-2`}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={`shrink-0 ${colors.text} opacity-60`}>
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 7v4M8 5.5v-.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className={`text-xs ${colors.text}`}>{currentStage.description}</span>
                        <span className={`ml-auto text-xs font-semibold ${colors.text}`}>{currentProgress.percent}%</span>
                    </div>
                </div>

                {/* ── Field list (scrollable) ── */}
                <div className="overflow-y-auto flex-1 min-h-0 px-6 py-2">
                    <div className="space-y-1.5">
                        {currentStage.fields.map((f) => {
                            const filled = isStageFieldFilled(data, f.key);
                            return (
                                <div key={f.key}
                                     className={`rounded-lg border px-3.5 py-2.5 transition-colors
                                         ${filled ? 'border-teal-100 bg-teal-50/40' : 'border-slate-100 bg-white'}`}>
                                    <div className="flex items-start gap-2.5">
                                        {/* Status dot */}
                                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0
                                            ${filled ? 'bg-teal-500' : 'border-2 border-slate-300'}`}>
                                            {filled && (
                                                <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        {/* Label + description */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${filled ? 'text-slate-400' : 'text-slate-800'}`}>
                                                    {f.label}
                                                </span>
                                                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none ${CADENCE_STYLES[f.cadence] ?? CADENCE_STYLES['if-needed']}`}>
                                                    {CADENCE_LABELS[f.cadence] ?? f.cadence}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">{f.description}</p>
                                        </div>
                                        {/* Table badge */}
                                        <span className="text-[9px] font-mono text-slate-300 shrink-0 mt-0.5 max-w-[100px] truncate" title={f.table}>
                                            {f.table}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Cadence legend (pinned at bottom) ── */}
                <div className="px-6 py-3.5 border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-1.5 mb-2">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-slate-400">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Reporting Frequency</span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                        {CADENCE_LEGEND.map((c) => (
                            <div key={c.key} className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none ${CADENCE_STYLES[c.key]}`}>
                                    {c.label}
                                </span>
                                <span className="text-[10px] text-slate-400">{c.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}