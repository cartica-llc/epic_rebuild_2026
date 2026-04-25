'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { ProjectFilters } from './ProjectFilters';
import { ProjectsListContainer } from './projectsList/ProjectsListContainer';
import { QuickQueryVisualization } from './QuickQueryVisualization';
// import { ProjectsPageHeader } from './ProjectsPageHeader';

/**
 * VIEW PARAM VALUES (defined in URL as ?view=<value>):
 *   - spending        → Insight_SpendingAnalysis
 *   - technology      → Insight_TechnologySearch
 *   - map             → Insight_LocationInsights
 *   - market          → Insight_StagesCommercialization
 *   - all-projects    → ProjectsList (default, no ?view param)
 */

export function ProjectsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const viewParam = searchParams.get('view');
    const searchParam = searchParams.get('search');

    const [activePrefilter, setActivePrefilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Hydrate from URL after mount (avoids SSR mismatch)
    useEffect(() => {
        if (searchParam) {
            setSearchTerm(searchParam);
            setActivePrefilter('all-projects');
        } else {
            setActivePrefilter(viewParam ?? 'all-projects');
        }
        // Only run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync activePrefilter → URL (only when activePrefilter changes)
    useEffect(() => {
        if (!activePrefilter) return; // skip before hydration

        const params = new URLSearchParams(searchParams.toString());

        if (activePrefilter !== 'all-projects') {
            params.set('view', activePrefilter);
        } else {
            params.delete('view');
        }

        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePrefilter]);

    return (
        <div className="min-h-screen bg-white pb-16 pt-32">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                {/*<ProjectsPageHeader viewParam={viewParam} />*/}

                <div className="lg:flex lg:gap-6">
                    <aside className="lg:w-[280px] lg:flex-shrink-0">
                        <ProjectFilters
                            activePrefilter={activePrefilter}
                            onPrefilterChange={setActivePrefilter}
                            initialPrefilter={viewParam ?? undefined}
                        />
                    </aside>

                    <div className="flex min-w-0 flex-1 flex-col">
                        <AnimatePresence mode="wait">
                            {activePrefilter && activePrefilter !== 'all-projects' && (
                                <div className="mb-6">
                                    <QuickQueryVisualization
                                        activeQuery={activePrefilter}
                                        onCategoryFilter={setCategoryFilter}
                                        onClose={() => setActivePrefilter('all-projects')}
                                    />
                                </div>
                            )}

                            {activePrefilter === 'all-projects' && (
                                <ProjectsListContainer
                                    categoryFilter={categoryFilter}
                                    onClearFilter={() => setCategoryFilter(null)}
                                    searchTerm={searchTerm}
                                    onSearchTermChange={setSearchTerm}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}