// components/projects_page/insights/Insight_Map.tsx

'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useInsightFetch } from './spending/shared/useInsightFetch';
import { MapHeader } from './map/MapHeader';
import { MapFiltersBar } from './map/MapFiltersBar';
import { MapSummaryCards } from './map/MapSummaryCards';
import { useMapFilters } from './map/useMapFilters';
import { useMapFilterOptions } from './map/useMapFilterOptions';
import type { MapProject, MapTotals } from './map/shared/types';

interface ProjectsResponse {
    projects: MapProject[];
    count: number;
    totals: MapTotals;
    truncated: boolean;
    limit: number;
}

const MapVisualization = dynamic(
    () => import('./map/MapVisualization').then((m) => m.MapVisualization),
    {
        loading: () => (
            <div
                className="animate-pulse rounded-md bg-neutral-900"
                style={{ height: 540 }}
            />
        ),
        ssr: false,
    },
);

const MapProjectList = dynamic(
    () => import('./map/MapProjectList').then((m) => m.MapProjectList),
    {
        loading: () => (
            <div
                className="animate-pulse rounded-md border border-slate-200 bg-slate-50"
                style={{ height: 320 }}
            />
        ),
        ssr: false,
    },
);

const MapSelectedProjectCard = dynamic(
    () =>
        import('./map/MapSelectedProjectCard').then(
            (m) => m.MapSelectedProjectCard,
        ),
    { ssr: false },
);

const EMPTY_RESPONSE: ProjectsResponse = {
    projects: [],
    count: 0,
    totals: { committed: 0, contracted: 0, expended: 0 },
    truncated: false,
    limit: 0,
};

export function Insight_Map() {
    const { filters, setArea, setDacliOnly, reset, hasActiveFilters, queryString } =
        useMapFilters();
    const { options, loading: optionsLoading } = useMapFilterOptions();

    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, loading, error } = useInsightFetch<ProjectsResponse>(
        `/api/map/projects?${queryString}`,
    );

    const response = data ?? EMPTY_RESPONSE;

    const selectedProject = useMemo(
        () => response.projects.find((p) => p.id === selectedId) ?? null,
        [response.projects, selectedId],
    );

    const handleAreaChange = (v: string) => {
        setArea(v);
        setSelectedId(null);
    };
    const handleDacliToggle = () => {
        setDacliOnly(!filters.dacliOnly);
        setSelectedId(null);
    };
    const handleReset = () => {
        reset();
        setSelectedId(null);
    };

    return (
        <div className="bg-white">
            {/* Header strip */}
            <div className="relative bg-white px-4 py-6 md:px-6 md:py-8">
                <div className="space-y-5">
                    <MapHeader
                        showReset={hasActiveFilters}
                        onReset={handleReset}
                    />

                    <MapFiltersBar
                        area={filters.area}
                        dacliOnly={filters.dacliOnly}
                        options={options}
                        optionsLoading={optionsLoading}
                        onAreaChange={handleAreaChange}
                        onDacliToggle={handleDacliToggle}
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
                <MapSummaryCards
                    count={response.count}
                    totals={response.totals}
                    loading={loading}
                />

                {/*
                  `key` deliberately tied to queryString — guarantees a clean
                  remount of the visualization (clearing any internal state)
                  whenever filter params change. Defensive against stale state.
                */}
                <MapVisualization
                    key={queryString}
                    projects={response.projects}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    loading={loading}
                    dacliFilterActive={filters.dacliOnly}
                />

                {selectedProject && (
                    <MapSelectedProjectCard
                        project={selectedProject}
                        onClose={() => setSelectedId(null)}
                    />
                )}

                <MapProjectList
                    projects={response.projects}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    loading={loading}
                    error={error}
                    truncated={response.truncated}
                    limit={response.limit}
                />
            </div>
        </div>
    );
}

export default Insight_Map;