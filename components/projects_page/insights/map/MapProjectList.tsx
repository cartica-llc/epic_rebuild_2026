// components/projects_page/insights/map/MapProjectList.tsx

'use client';

import { useEffect, useRef } from 'react';
import { MapProjectCard } from './MapProjectCard';
import type { MapProject } from './shared/types';

interface MapProjectListProps {
    projects: MapProject[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
    loading: boolean;
    error: string | null;
    truncated: boolean;
    limit: number;
}

export function MapProjectList({
    projects,
    selectedId,
    onSelect,
    loading,
    error,
    truncated,
    limit,
}: MapProjectListProps) {
    const listRef = useRef<HTMLDivElement>(null);

    /**
     * When the user clicks a dot on the map, scroll the matching card into
     * view in the list. Keeps map and list in sync as a coordinated pair.
     */
    useEffect(() => {
        if (selectedId === null || !listRef.current) return;
        const card = listRef.current.querySelector<HTMLElement>(
            `[data-project-id="${selectedId}"]`,
        );
        card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [selectedId]);

    return (
        <section className="rounded-md border border-slate-200 bg-white p-4 md:p-5">
            <header className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900">
                    Projects in view
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                    {loading
                        ? 'Loading…'
                        : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
                    {truncated && (
                        <span className="ml-1 text-amber-700">
                            · Top {limit} shown
                        </span>
                    )}
                </p>
            </header>

            {loading ? (
                <ListSkeleton />
            ) : error ? (
                <div className="rounded-md border border-dashed border-red-200 bg-red-50 p-8 text-center">
                    <p className="text-sm font-semibold text-red-900">
                        Couldn&apos;t load projects
                    </p>
                    <p className="mt-1 text-xs text-red-700">{error}</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                    <p className="mb-1 text-sm font-semibold text-slate-900">
                        No projects match
                    </p>
                    <p className="text-xs text-slate-500">
                        Adjust filters above or reset to see all projects.
                    </p>
                </div>
            ) : (
                <div
                    ref={listRef}
                    className="max-h-[520px] space-y-2 overflow-y-auto pr-1"
                >
                    {projects.map((project) => (
                        <div key={project.id} data-project-id={project.id}>
                            <MapProjectCard
                                project={project}
                                isSelected={selectedId === project.id}
                                onSelect={() =>
                                    onSelect(
                                        selectedId === project.id ? null : project.id,
                                    )
                                }
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-2" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-md border border-slate-200 bg-white p-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
            ))}
        </div>
    );
}
