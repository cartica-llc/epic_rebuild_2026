'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { ProjectFilters } from './ProjectFilters';
import { ProjectsListContainer } from './projectsList/ProjectsListContainer';
import { QuickQueryVisualization } from './QuickQueryVisualization';
import { ProjectsPageHeader } from './ProjectsPageHeader';


const LIST_PREFILTERS = ['all-projects', 'recently-added', 'recently-completed'];

export function ProjectsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const viewParam = searchParams.get('view');
    const searchParam = searchParams.get('search');

    const [activePrefilter, setActivePrefilter] = useState(() =>
        searchParam ? 'all-projects' : viewParam ?? 'all-projects',
    );

    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(() => searchParam ?? '');

    // Sync activePrefilter to URL when it changes.
    useEffect(() => {
        if (!activePrefilter) return;

        const params = new URLSearchParams(window.location.search);

        if (activePrefilter !== 'all-projects') {
            params.set('view', activePrefilter);
        } else {
            params.delete('view');
        }

        const queryString = params.toString();
        const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
        const currentUrl = `${window.location.pathname}${window.location.search}`;

        if (nextUrl === currentUrl) {
            return;
        }

        router.replace(nextUrl, { scroll: false });
    }, [activePrefilter, pathname, router]);

    const showsProjectList = LIST_PREFILTERS.includes(activePrefilter);

    return (
        <div className="min-h-screen bg-white py-4">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <ProjectsPageHeader
                    viewParam={viewParam}
                    activePrefilter={activePrefilter}
                    onPrefilterChange={setActivePrefilter}
                />

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
                            {activePrefilter && !showsProjectList && (
                                <div className="mb-6">
                                    <QuickQueryVisualization
                                        activeQuery={activePrefilter}
                                        onClose={() =>
                                            setActivePrefilter('all-projects')
                                        }
                                    />
                                </div>
                            )}

                            {showsProjectList && (
                                <ProjectsListContainer
                                    activePrefilter={activePrefilter}
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