// components/projects_page/insights/Insight_SpendingAnalysis.tsx

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SpendingHeader } from './spending/SpendingHeader';
import { SpendingFilters } from './spending/SpendingFilters';
import { SpendingTabBar, type SpendingTab } from './spending/SpendingTabBar';
import { useSpendingFilters } from './spending/useSpendingFilters';
import { useSpendingFilterOptions } from './spending/useSpendingFilterOptions';
import { ChartSkeleton } from './spending/shared/SectionCard';

const tabSkeleton = () => (
    <div className="space-y-5">
        <div className="h-[180px] animate-pulse rounded-md border border-slate-200 bg-slate-50" />
        <ChartSkeleton />
    </div>
);

const SpendingOverviewTab = dynamic(() => import('./spending/tabs/SpendingOverviewTab'), {
    loading: tabSkeleton,
    ssr: false,
});
const LeverageMatchTab = dynamic(() => import('./spending/tabs/LeverageMatchTab'), {
    loading: tabSkeleton,
    ssr: false,
});
const AwardSizeTab = dynamic(() => import('./spending/tabs/AwardSizeTab'), {
    loading: tabSkeleton,
    ssr: false,
});
const CommunityRequirementsTab = dynamic(
    () => import('./spending/tabs/CommunityRequirementsTab'),
    { loading: tabSkeleton, ssr: false },
);

export function Insight_SpendingAnalysis() {
    const [activeTab, setActiveTab] = useState<SpendingTab>('overview');
    const { filters, setPeriod, setArea, reset, queryString } = useSpendingFilters();
    const { periods, areas, loading: optionsLoading } = useSpendingFilterOptions();

    return (
        <div className="bg-white">
            {/* Header strip */}
            <div className="relative bg-white px-4 py-6 md:px-6 md:py-8">
                <div className="space-y-5">
                    <SpendingHeader onReset={reset} />

                    <SpendingFilters
                        filters={filters}
                        periods={periods}
                        areas={areas}
                        onPeriodChange={setPeriod}
                        onAreaChange={setArea}
                        optionsLoading={optionsLoading}
                    />

                    <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

                    <SpendingTabBar active={activeTab} onChange={setActiveTab} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6">
                    <div
                        className="h-[2px] w-full"
                        style={{
                            background:
                                'linear-gradient(90deg, transparent, #0f172a 8%, #64748b 40%, #cbd5e1 70%, transparent)',
                        }}
                    />
                </div>
            </div>


            <div className="px-4 py-5 md:px-6 md:py-6">
                {activeTab === 'overview' && (
                    <SpendingOverviewTab queryString={queryString} />
                )}
                {activeTab === 'leverage' && (
                    <LeverageMatchTab queryString={queryString} />
                )}
                {activeTab === 'awards' && <AwardSizeTab queryString={queryString} />}
                {activeTab === 'community' && (
                    <CommunityRequirementsTab queryString={queryString} />
                )}
            </div>
        </div>
    );
}

export default Insight_SpendingAnalysis;