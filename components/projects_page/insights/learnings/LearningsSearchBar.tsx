// components/projects_page/insights/learnings/LearningsSearchBar.tsx

'use client';

import { Search, X } from 'lucide-react';

interface LearningsSearchBarProps {
    value: string;
    onChange: (v: string) => void;
}

export function LearningsSearchBar({ value, onChange }: LearningsSearchBarProps) {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search hydropower, climate, microgrid…"
                className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition hover:text-slate-700"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
