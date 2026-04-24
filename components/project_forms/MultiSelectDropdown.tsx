// ─── components/project_forms/MultiSelectDropdown.tsx ─────────────────

'use client';

import { useEffect, useRef, useState } from 'react';

export function MultiSelectDropdown({ value = [], onChange, options, placeholder = 'Select options...' }: {
    value: (string | number)[]; onChange: (v: (string | number)[]) => void;
    options: { value: string | number; label: string }[]; placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleValue = (v: string | number) => {
        onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    };

    const selectedLabels = options.filter((o) => value.includes(o.value)).map((o) => o.label);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className={`w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${open ? 'border-slate-400 ring-2 ring-slate-200' : ''}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                        {selectedLabels.length > 0 ? selectedLabels.map((l) => (
                            <span key={l} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{l}</span>
                        )) : (
                            <span className="text-slate-400">{placeholder}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        {value.length > 0 && (
                            <span onClick={(e) => { e.stopPropagation(); onChange([]); }} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Clear</span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </button>
            {open && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-64 overflow-auto">
                    <div className="p-2">
                        {options.map((o) => {
                            const checked = value.includes(o.value);
                            return (
                                <button key={o.value} type="button" onClick={() => toggleValue(o.value)}
                                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition-colors">
                                    <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${checked ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-300'}`}>
                                        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    </div>
                                    <span className="text-sm text-slate-700">{o.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
