// ─── components/project_forms/CompanyMultiSelect.tsx ──────────────────

'use client';

import { useEffect, useRef, useState } from 'react';
import type { LookupItem } from './types';

export function CompanyMultiSelect({ value, onChange, companies, onAddNew, placeholder = 'Search partners...' }: {
    value: number[];
    onChange: (ids: number[]) => void;
    companies: LookupItem[];
    onAddNew?: () => void;
    placeholder?: string;
}) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedNames = companies.filter((c) => value.includes(c.id));
    const filtered = companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50);

    const toggle = (id: number) => {
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    };

    return (
        <div className="flex gap-1.5">
            <div className="relative flex-1" ref={ref}>
                <div
                    className={`w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-2 transition-all ${open ? 'border-slate-400 ring-2 ring-slate-200' : ''}`}
                    onClick={() => setOpen(true)}
                >
                    <div className="flex flex-wrap gap-1.5 mb-1">
                        {selectedNames.map((c) => (
                            <span key={c.id} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                                {c.name}
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggle(c.id); }} className="text-slate-400 hover:text-slate-600">×</button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                        placeholder={value.length === 0 ? placeholder : 'Add more...'}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
                        onFocus={() => setOpen(true)}
                    />
                </div>
                {value.length > 0 && (
                    <button type="button" onClick={() => onChange([])}
                            className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-600">Clear</button>
                )}
                {open && (
                    <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-56 overflow-auto">
                        <div className="p-2">
                            {filtered.length === 0 ? (
                                <div className="px-3 py-4 text-center text-sm text-slate-400">
                                    {companies.length === 0 ? 'Loading companies…' : 'No matches found'}
                                </div>
                            ) : filtered.map((c) => {
                                const checked = value.includes(c.id);
                                return (
                                    <button key={c.id} type="button" onClick={() => toggle(c.id)}
                                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition-colors">
                                        <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${checked ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-300'}`}>
                                            {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        </div>
                                        <span className="text-sm text-slate-700">{c.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {onAddNew && (
                <button type="button" onClick={onAddNew}
                        className="flex-none h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors self-start"
                        title="Add new company">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
