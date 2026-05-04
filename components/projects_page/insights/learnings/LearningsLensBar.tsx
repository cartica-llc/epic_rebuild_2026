// components/projects_page/insights/learnings/LearningsLensBar.tsx

'use client';

import { BarChart3 } from 'lucide-react';
import { LENS_OPTIONS, type NarrativeLens } from './shared/types';

interface LearningsLensBarProps {
    active: NarrativeLens | null;
    onChange: (lens: NarrativeLens | null) => void;
}

export function LearningsLensBar({ active, onChange }: LearningsLensBarProps) {
    return (
        <div>
            <div className="mb-3 flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500">View results by</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {LENS_OPTIONS.map((item) => {
                    const isActive = active === item.key;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onChange(isActive ? null : item.key)}
                            aria-pressed={isActive}
                            className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${
                                isActive
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
