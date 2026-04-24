// ─── components/project_forms/CompanySearchSelect.tsx ─────────────────

'use client';

import { useEffect, useRef, useState } from 'react';
import { inputClass, type LookupItem } from './types';

export function CompanySearchSelect({ value, onChange, companies, onAddNew, placeholder = 'Search companies...' }: {
    value: number | '';
    onChange: (id: number | '') => void;
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

    const selectedName = companies.find((c) => c.id === value)?.name ?? '';
    const filtered = companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50);

    return (
        <div className="relative" ref={ref}>
            <div className="flex gap-1.5">
                <div className="relative flex-1">
                    <input
                        type="text"
                        className={inputClass}
                        placeholder={value ? selectedName : placeholder}
                        value={open ? search : (value ? selectedName : '')}
                        onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
                        onFocus={() => setOpen(true)}
                    />
                    {value && (
                        <button type="button" onClick={() => { onChange(''); setSearch(''); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                            ✕
                        </button>
                    )}
                </div>
                {onAddNew && (
                    <button type="button" onClick={onAddNew}
                            className="flex-none h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                            title="Add new company">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                )}
            </div>
            {open && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-56 overflow-auto">
                    <div className="p-2">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-slate-400">
                                {companies.length === 0 ? 'Loading companies…' : 'No matches found'}
                            </div>
                        ) : filtered.map((c) => (
                            <button key={c.id} type="button"
                                    onClick={() => { onChange(c.id); setSearch(''); setOpen(false); }}
                                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${c.id === value ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
