'use client';

import React from 'react';
import { Check, ChevronDown, Flag as FlagIcon } from 'lucide-react';

import { CONSISTENCY_FLAG_META, FLAG_META, type FlagMetaEntry } from './uiPrimitives';
import type { ConsistencyFlagId, EnrichedProject, FlagId } from './types';

export type FlagFilterValue = FlagId | ConsistencyFlagId | 'All';

const OPERATIONAL_ORDER: FlagId[] = [
    'closed-incomplete',
    'missing-final-report',
    'approaching-deadline-stale',
    'past-end-date',
    'stalled-pending',
    'no-recent-update',
];

const CONSISTENCY_ORDER: ConsistencyFlagId[] = [
    'completed-zero-spend',
    'end-before-start',
    'overspend-budget',
    'award-after-start',
    'encumbered-exceeds-committed',
];

function isConsistencyId(id: FlagId | ConsistencyFlagId): id is ConsistencyFlagId {
    return id in CONSISTENCY_FLAG_META;
}

export function FlagFilterMenu({
                                   value,
                                   onChange,
                                   projects,
                               }: {
    value: FlagFilterValue;
    onChange: (v: FlagFilterValue) => void;
    projects: EnrichedProject[];
}) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;
        function onDocClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const counts = React.useMemo(() => {
        const map = new Map<string, number>();
        for (const id of OPERATIONAL_ORDER) {
            map.set(id, projects.filter((p) => p.flags.some((f) => f.id === id)).length);
        }
        for (const id of CONSISTENCY_ORDER) {
            map.set(id, projects.filter((p) => p.consistencyFlags.some((f) => f.id === id)).length);
        }
        return map;
    }, [projects]);

    const totalFlagged = React.useMemo(
        () => projects.filter((p) => p.flags.length > 0 || p.consistencyFlags.length > 0).length,
        [projects],
    );

    const currentMeta: FlagMetaEntry | null =
        value === 'All' ? null : isConsistencyId(value) ? CONSISTENCY_FLAG_META[value] : FLAG_META[value];

    function selectAndClose(v: FlagFilterValue) {
        onChange(v);
        setOpen(false);
    }

    function renderRow(id: FlagId | ConsistencyFlagId, meta: FlagMetaEntry) {
        const Icon = meta.icon;
        const count = counts.get(id) ?? 0;
        const isSelected = value === id;
        return (
            <button
                key={id}
                type="button"
                onClick={() => selectAndClose(id)}
                disabled={count === 0}
                className={`flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition ${
                    isSelected
                        ? 'border-indigo-200 bg-slate-50'
                        : `border-transparent ${count > 0 ? 'hover:bg-slate-50' : ''}`
                } ${count === 0 ? 'cursor-not-allowed opacity-40' : ''}`}
            >
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${meta.color}`} />
                <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                            {meta.label}
                        </span>
                        <span
                            className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
                                isSelected ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            {count}
                        </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{meta.description}</span>
                </span>
                {isSelected && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />}
            </button>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={open}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    value !== 'All'
                        ? 'border-indigo-200 bg-white text-indigo-600'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
            >
                {currentMeta ? (
                    <currentMeta.icon className="h-3.5 w-3.5" />
                ) : (
                    <FlagIcon className="h-3.5 w-3.5 text-slate-400" />
                )}
                {currentMeta ? currentMeta.label : 'All Flags'}
                <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-20 mt-1.5 w-80 max-w-[90vw] rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                    <button
                        type="button"
                        onClick={() => selectAndClose('All')}
                        className={`mb-1 flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                            value === 'All'
                                ? 'border-indigo-200 bg-slate-50 text-indigo-600'
                                : 'border-transparent text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>All flags</span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
                                    value === 'All' ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {totalFlagged}
                            </span>
                            {value === 'All' && <Check className="h-3.5 w-3.5 text-indigo-500" />}
                        </span>
                    </button>

                    <div className="my-1.5 border-t border-slate-100" />

                    <p className="px-2.5 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Operational — needs follow-up
                    </p>
                    <div className="space-y-0.5">{OPERATIONAL_ORDER.map((id) => renderRow(id, FLAG_META[id]))}</div>

                    <div className="my-2 border-t border-slate-100" />

                    <p className="px-2.5 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Data consistency — fields contradict each other
                    </p>
                    <div className="space-y-0.5">
                        {CONSISTENCY_ORDER.map((id) => renderRow(id, CONSISTENCY_FLAG_META[id]))}
                    </div>
                </div>
            )}
        </div>
    );
}