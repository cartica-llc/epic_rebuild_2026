// ─── components/project_forms/FormTabs.tsx ───────────────────────────

'use client';

import { TABS } from './types';

export function FormTabs({ activeTab, setActiveTab, className = '', showDanger = false }: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    className?: string;
    showDanger?: boolean;
}) {

    const visibleTabs = TABS.filter((t) => t.id !== 'danger' || showDanger);

    return (
        <div className={className}>

            <div className="overflow-x-auto scrollbar-hide -mb-px">
                <div className="flex min-w-max border-b border-slate-200">
                    {visibleTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const isDanger = tab.id === 'danger';


                        const classes = isDanger
                            ? `flex-shrink-0 px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                                isActive
                                    ? 'text-red-700 border-b-2 border-red-600'
                                    : 'text-red-500 hover:text-red-700'
                            }`
                            : `flex-shrink-0 px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                                isActive
                                    ? 'text-slate-900 border-b-2 border-slate-900'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={classes}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}