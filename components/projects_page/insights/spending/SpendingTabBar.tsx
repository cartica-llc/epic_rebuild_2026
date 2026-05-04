// components/projects_page/insights/spending/SpendingTabBar.tsx

'use client';

import { BarChart3 } from 'lucide-react';

export type SpendingTab = 'overview' | 'leverage' | 'awards' | 'community';

interface SpendingTabBarProps {
    active: SpendingTab;
    onChange: (tab: SpendingTab) => void;
}

const TABS: { key: SpendingTab; label: string }[] = [
    { key: 'overview', label: 'Spending Overview' },
    { key: 'leverage', label: 'Leverage & Match' },
    { key: 'awards', label: 'Award Size' },
    { key: 'community', label: 'Community Requirements' },
];

export function SpendingTabBar({ active, onChange }: SpendingTabBarProps) {
    return (
        <div>
            <div className="mb-3 flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500">Analysis view</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${
                            active === tab.key
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
