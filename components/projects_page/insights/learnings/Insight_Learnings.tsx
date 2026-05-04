// components/projects_page/insights/Insight_Learnings.tsx

'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { LearningsHeader } from './LearningsHeader';
import { LearningsSearchBar } from './LearningsSearchBar';
import { LearningsTopicChips } from './LearningsTopicChips';
import { LearningsLensBar } from './LearningsLensBar';
import { LearningsFilters } from './LearningsFilters';
import { useLearningsFilterOptions } from './useLearningsFilterOptions';
import { useLearningsSearch } from './useLearningsSearch';
import type { NarrativeLens } from './shared/types';

const LearningsResults = dynamic(
    () => import('./LearningsResults').then((m) => m.LearningsResults),
    { ssr: false },
);

export function Insight_Learnings() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedProceeding, setSelectedProceeding] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedLens, setSelectedLens] = useState<NarrativeLens | null>(null);

    const { options, loading: optionsLoading } = useLearningsFilterOptions();

    const searchParams = useMemo(
        () => ({
            q: searchTerm,
            lens: selectedLens,
            area: selectedArea,
            proceeding: selectedProceeding,
            status: selectedStatus,
        }),
        [searchTerm, selectedLens, selectedArea, selectedProceeding, selectedStatus],
    );

    const { data, loading, error, hasSearchIntent } = useLearningsSearch(searchParams);

    const activeFilterCount = [selectedArea, selectedProceeding, selectedStatus].filter(
        Boolean,
    ).length;

    const reset = useCallback(() => {
        setSearchTerm('');
        setSelectedArea('');
        setSelectedProceeding('');
        setSelectedStatus('');
        setSelectedLens(null);
    }, []);

    return (
        <div className="bg-white">
            {/* Header strip */}
            <div className="relative bg-white px-4 py-6 md:px-6 md:py-8">
                <div className="space-y-5">
                    <LearningsHeader showReset={hasSearchIntent} onReset={reset} />

                    <LearningsSearchBar value={searchTerm} onChange={setSearchTerm} />

                    <LearningsTopicChips activeTerm={searchTerm} onSelect={setSearchTerm} />

                    <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

                    <LearningsLensBar active={selectedLens} onChange={setSelectedLens} />

                    <LearningsFilters
                        values={{
                            area: selectedArea,
                            proceeding: selectedProceeding,
                            status: selectedStatus,
                        }}
                        options={options}
                        optionsLoading={optionsLoading}
                        onAreaChange={setSelectedArea}
                        onProceedingChange={setSelectedProceeding}
                        onStatusChange={setSelectedStatus}
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

            {/* Results — only mount once the user has shown intent */}
            {hasSearchIntent && (
                <LearningsResults
                    projects={data.projects}
                    totalCommitted={data.totalCommitted}
                    count={data.count}
                    truncated={data.truncated}
                    limit={data.limit}
                    loading={loading}
                    error={error}
                    activeLens={selectedLens}
                    searchTerm={searchTerm}
                    activeFilterCount={activeFilterCount}
                />
            )}
        </div>
    );
}

export default Insight_Learnings;
