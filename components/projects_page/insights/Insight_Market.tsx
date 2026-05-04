// components/projects_page/insights/Insight_Market.tsx

'use client';

import dynamic from 'next/dynamic';
import { MarketHeader } from './market/MarketHeader';
import { MarketFiltersBar } from './market/MarketFiltersBar';
import { MarketMethodologyPanel } from './market/MarketMethodologyPanel';
import { useMarketFilters } from './market/useMarketFilters';

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
        setMinScore,
        setNearMarketOnly,
        reset,
        hasActiveFilters,
        projectsQueryString,
    } = useMarketFilters();

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
                        onMinScoreChange={setMinScore}
                        onNearMarketChange={setNearMarketOnly}
                        hasActiveFilters={hasActiveFilters}
                        onReset={reset}
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
                    queryString={projectsQueryString}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>
        </div>
    );
}

export default Insight_Market;