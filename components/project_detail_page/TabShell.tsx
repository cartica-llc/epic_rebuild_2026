'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ProjectCore } from './types';

type Tab = 'overview' | 'story' | 'analytics' | 'finance';

const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'story', label: 'Story' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'finance', label: 'Finance' },
];

function TabFallback() {
    return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
    );
}

const OverviewTab = dynamic(
    () => import('./overview/OverviewTab').then((m) => m.OverviewTab),
    { loading: TabFallback, ssr: false }
);
const StoryTab = dynamic(
    () => import('./story/StoryTab').then((m) => m.StoryTab),
    { loading: TabFallback, ssr: false }
);
const AnalyticsTab = dynamic(
    () => import('./analytics/AnalyticsTab').then((m) => m.AnalyticsTab),
    { loading: TabFallback, ssr: false }
);
const FinanceTab = dynamic(
    () => import('./finance/FinanceTab').then((m) => m.FinanceTab),
    { loading: TabFallback, ssr: false }
);

type Props = {
    project: ProjectCore;
};

export function TabShell({ project }: Props) {
    const [tab, setTab] = useState<Tab>('overview');

    return (
        <>
            {/* Tab nav — sticky below header, light background */}
            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md print:hidden">
                <div className="mx-auto max-w-5xl px-6 sm:px-8">
                    <div className="flex gap-1">
                        {TABS.map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setTab(id)}
                                className={[
                                    'relative px-5 py-3.5 text-[13px] font-semibold transition-colors',
                                    tab === id
                                        ? 'text-slate-900'
                                        : 'text-slate-400 hover:text-slate-700',
                                ].join(' ')}
                            >
                                {label}
                                {tab === id && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-slate-900" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 pt-10 sm:px-8">
                {tab === 'overview' && <OverviewTab project={project} />}
                {tab === 'story' && <StoryTab projectId={project.id} />}
                {tab === 'analytics' && (
                    <AnalyticsTab
                        projectId={project.id}
                        cpucDac={project.cpucDac}
                        cpucLi={project.cpucLi}
                    />
                )}
                {tab === 'finance' && <FinanceTab projectId={project.id} />}
            </main>
        </>
    );
}
