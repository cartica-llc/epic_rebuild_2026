// ─── components/project_forms/DistrictSearchSelect.tsx ────────────────

'use client';

import { useEffect, useRef, useState } from 'react';
import type { LookupItem } from './types';

export function DistrictSearchSelect({
    value, onChange, districts, placeholder = 'Search districts...',
}: {
    value: number | '';
    onChange: (id: number | '') => void;
    districts: LookupItem[];
    placeholder?: string;
}) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = districts.find((d) => d.id === value);
    const filtered = districts.filter((d) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return String(d.id).startsWith(q) || d.name.toLowerCase().includes(q);
    });

    const handleSelect = (d: LookupItem) => { onChange(d.id); setOpen(false); setSearch(''); };
    const handleClear = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); setSearch(''); };

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen((s) => !s)}
                 className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 cursor-pointer transition-all flex items-center gap-2
                     ${open ? 'border-slate-400 ring-2 ring-slate-200' : 'border-slate-200 hover:border-slate-300'}`}>
                {selected ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="shrink-0 inline-flex items-center justify-center w-8 h-6 rounded bg-slate-900 text-white text-[11px] font-semibold">{selected.id}</span>
                        <span className="text-sm text-slate-700 truncate">{selected.name}</span>
                    </div>
                ) : (
                    <span className="text-sm text-slate-400 flex-1">{placeholder}</span>
                )}
                <div className="flex items-center gap-1.5 shrink-0">
                    {selected && <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-600 text-xs leading-none">✕</button>}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
            {open && (
                <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    <div className="px-3 pt-3 pb-2 border-b border-slate-100">
                        <input autoFocus type="text"
                               className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                               placeholder="Search by number or location…" value={search}
                               onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-slate-400">No districts match</div>
                        ) : (
                            <div className="p-2 space-y-0.5">
                                {filtered.map((d) => (
                                    <button key={d.id} type="button" onClick={() => handleSelect(d)}
                                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${d.id === value ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                                        <span className={`shrink-0 inline-flex items-center justify-center w-8 h-6 rounded text-[11px] font-semibold ${d.id === value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{d.id}</span>
                                        <span className="text-sm text-slate-700 leading-snug">{d.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
