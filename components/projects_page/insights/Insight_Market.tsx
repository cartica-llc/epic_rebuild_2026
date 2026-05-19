// components/projects_page/insights/Insight_Market.tsx

'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MarketHeader } from './market/MarketHeader';
import { MarketFiltersBar } from './market/MarketFiltersBar';
import { MarketMethodologyPanel } from './market/MarketMethodologyPanel';
import { useMarketFilters } from './market/useMarketFilters';
import { useInsightFetch } from './spending/shared/useInsightFetch';
import type { MarketProject } from './market/shared/types';

interface ProjectsResponse {
    projects: MarketProject[];
    count: number;
    truncated: boolean;
    limit: number;
}

const MarketSignalMix = dynamic(
    () => import('./market/MarketSignalMix').then((m) => m.MarketSignalMix),
    {
        loading: () => (
            <div
                className="animate-pulse rounded-md border border-slate-200 bg-slate-50"
                style={{ height: 360 }}
            />
        ),
        ssr: false,
    },
);

const MarketProjectsTable = dynamic(
    () =>
        import('./market/MarketProjectsTable').then((m) => m.MarketProjectsTable),
    {
        loading: () => (
            <div
                className="animate-pulse rounded-md border border-slate-200 bg-slate-50"
                style={{ height: 360 }}
            />
        ),
        ssr: false,
    },
);

export function Insight_Market() {
    const {
        filters,
        setMaturity,
        setBand,
        setScoreFilter,
        reset,
        hasActiveFilters,
        projectsQueryString,
    } = useMarketFilters();

    // Fetch the full unfiltered list to derive score distribution for the
    // filter dropdown. Same URL as the table's unfiltered state — deduplicated
    // by useInsightFetch's cache, no extra network request.
    const { data } = useInsightFetch<ProjectsResponse>('/api/market/projects');

    const scoreCounts = useMemo(() => {
        const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const p of data?.projects ?? []) {
            if (p.signalScore >= 1 && p.signalScore <= 5) {
                counts[p.signalScore] = (counts[p.signalScore] ?? 0) + 1;
            }
        }
        return counts;
    }, [data]);

    // Changing filters remounts the table via `key`, which resets its internal
    // page state to 1 — no useEffect or setState-in-effect needed in the table.
    const tableKey = `${projectsQueryString}::${filters.scoreFilter}`;

    return (
        <div className="bg-white">
            {/* Header strip */}
            <div className="relative bg-white px-4 py-6 md:px-6 md:py-8">
                <div className="space-y-5">
                    <MarketHeader
                        showReset={hasActiveFilters}
                        onReset={reset}
                    />

                    <MarketMethodologyPanel />

                    <MarketFiltersBar
                        filters={filters}
                        onMaturityChange={setMaturity}
                        onBandChange={setBand}
                        onScoreFilterChange={setScoreFilter}
                        hasActiveFilters={hasActiveFilters}
                        onReset={reset}
                        scoreCounts={data ? scoreCounts : undefined}
                    />
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

            {/* Body */}
            <div className="space-y-5 px-4 py-5 md:px-6 md:py-6">
                <MarketSignalMix
                    activeMaturity={filters.maturity}
                    onMaturitySelect={setMaturity}
                />

                <MarketProjectsTable
                    key={tableKey}
                    queryString={projectsQueryString}
                    hasActiveFilters={hasActiveFilters}
                    scoreFilter={filters.scoreFilter}
                />
            </div>
        </div>
    );
}

export default Insight_Market;