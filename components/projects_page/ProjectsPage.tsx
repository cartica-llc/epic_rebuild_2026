'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { ProjectFilters } from './ProjectFilters';
import { ProjectsListContainer } from './projectsList/ProjectsListContainer';
import { QuickQueryVisualization } from './QuickQueryVisualization';
// import { ProjectsPageHeader } from './ProjectsPageHeader';

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

    return (
        <div className="min-h-screen bg-white pb-16 pt-32">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                {/* <ProjectsPageHeader viewParam={viewParam} /> */}

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
                            {activePrefilter &&
                                activePrefilter !== 'all-projects' && (
                                    <div className="mb-6">
                                        <QuickQueryVisualization
                                            activeQuery={activePrefilter}
                                            onClose={() =>
                                                setActivePrefilter('all-projects')
                                            }
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