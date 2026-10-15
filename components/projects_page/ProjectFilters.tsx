//components/projects_page/ProjectFilters.tsx
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

interface ProjectFiltersProps {
    activePrefilter: string;
    onPrefilterChange: (id: string) => void;
    initialPrefilter?: string;
}

interface PrefilterQuery {
    id: string;
    label: string;
    description: string;
}

const projectListingQueries: PrefilterQuery[] = [
    {
        id: 'all-projects',
        label: 'Browse all projects',
        description: 'Full project database',
    },
    {
        id: 'recently-added',
        label: 'Recently added',
        description: 'Newest projects in the database',
    },
    {
        id: 'recently-completed',
        label: 'Recently completed',
        description: 'Projects that have recently wrapped up',
    },
];

const quickInsightQueries: PrefilterQuery[] = [
    {
        id: 'spending',
        label: 'Spending',
        description: 'Track spending & program-program-compliance',
    },
    {
        id: 'technology',
        label: 'Key Learnings',
        description: 'Browse by topic & expertise',
    },
    {
        id: 'map',
        label: 'Project Map',
        description: 'Map / district view',
    },
    {
        id: 'market',
        label: 'Market Maturity',
        description: "Where projects are and who's close to market",
    },
];

export function ProjectFilters({
                                   activePrefilter,
                                   onPrefilterChange,
                                   initialPrefilter,
                               }: ProjectFiltersProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const sidebarRef = useRef<HTMLDivElement | null>(null);

    const clearPrefilter = useCallback(() => {
        onPrefilterChange('all-projects');
    }, [onPrefilterChange]);

    const handlePrefilter = useCallback(
        (id: string) => {
            if (activePrefilter === id) {
                clearPrefilter();
                return;
            }

            onPrefilterChange(id);

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        },
        [activePrefilter, clearPrefilter, onPrefilterChange],
    );

    useEffect(() => {
        const topOffset = 96;

        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            const sidebar = sidebarRef.current;

            if (!wrapper || !sidebar) return;

            const wrapperRect = wrapper.getBoundingClientRect();
            const sidebarHeight = sidebar.offsetHeight;
            const scrolledPast = topOffset - wrapperRect.top;

            if (scrolledPast <= 0) {
                sidebar.style.transform = 'translateY(0px)';
            } else {
                const maxTranslate = wrapper.offsetHeight - sidebarHeight;

                const translate = Math.min(
                    scrolledPast,
                    Math.max(0, maxTranslate),
                );

                sidebar.style.transform = `translateY(${translate}px)`;
            }
        };

        const mediaQuery = window.matchMedia('(min-width: 1024px)');

        const setup = () => {
            if (mediaQuery.matches) {
                window.addEventListener('scroll', handleScroll, {
                    passive: true,
                });

                window.addEventListener('resize', handleScroll, {
                    passive: true,
                });

                handleScroll();
            } else {
                if (sidebarRef.current) {
                    sidebarRef.current.style.transform = '';
                }

                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleScroll);
            }
        };

        setup();
        mediaQuery.addEventListener('change', setup);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            mediaQuery.removeEventListener('change', setup);
        };
    }, []);

    useEffect(() => {
        if (!initialPrefilter || activePrefilter) return;

        const frame = window.requestAnimationFrame(() => {
            handlePrefilter(initialPrefilter);
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [initialPrefilter, activePrefilter, handlePrefilter]);

    const projectListingContent = (
        <div className="select-none">
            <div className="space-y-1">
                {projectListingQueries.map((query) => {
                    const isActive = activePrefilter === query.id;

                    return (
                        <button
                            key={query.id}
                            type="button"
                            onClick={() => handlePrefilter(query.id)}
                            onDoubleClick={clearPrefilter}
                            className={`group relative flex w-full items-center rounded-lg px-4 py-3 text-left transition-colors ${
                                isActive
                                    ? 'bg-slate-50 text-slate-950'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-sky-600 via-emerald-600 to-rose-600" />
                            )}

                            <span
                                className={`text-sm ${
                                    isActive
                                        ? 'font-semibold'
                                        : 'font-medium'
                                }`}
                            >
                                {query.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const quickInsightsContent = (
        <div className="select-none">
            <div className="mb-4 hidden lg:block">
                <div className="flex items-center gap-2">
                    <Zap
                        className="h-5 w-5 flex-shrink-0"
                        style={{
                            stroke: 'url(#zapGradientDesktop)',
                            fill: 'url(#zapGradientDesktop)',
                        }}
                    />

                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                        Quick Insights
                    </h3>

                    <svg
                        width="0"
                        height="0"
                        className="absolute"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient
                                id="zapGradientDesktop"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#0284c7"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#059669"
                                />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {quickInsightQueries.map((query) => {
                    const isActive = activePrefilter === query.id;

                    return (
                        <button
                            key={query.id}
                            type="button"
                            onClick={() => handlePrefilter(query.id)}
                            onDoubleClick={clearPrefilter}
                            className={`group relative w-full rounded-lg px-4 py-3 text-left transition-colors ${
                                isActive ? 'bg-slate-50' : 'hover:bg-slate-50'
                            }`}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-600 via-emerald-600 to-rose-600" />
                            )}

                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div
                                        className={`mb-1 text-sm font-bold ${
                                            isActive
                                                ? 'text-slate-900'
                                                : 'text-slate-700 group-hover:text-slate-900'
                                        }`}
                                    >
                                        {query.label}
                                    </div>

                                    <div
                                        className={`text-xs ${
                                            isActive
                                                ? 'text-slate-600'
                                                : 'text-slate-500 group-hover:text-slate-600'
                                        }`}
                                    >
                                        {query.description}
                                    </div>
                                </div>

                                {isActive && (
                                    <Zap
                                        className="h-5 w-5 flex-shrink-0"
                                        style={{
                                            stroke: 'url(#zapGradientActiveInsights)',
                                            fill: 'url(#zapGradientActiveInsights)',
                                        }}
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <svg
                width="0"
                height="0"
                className="absolute"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient
                        id="zapGradientActiveInsights"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop
                            offset="0%"
                            stopColor="#0284c7"
                        />
                        <stop
                            offset="100%"
                            stopColor="#059669"
                        />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );

    return (
        <div
            ref={wrapperRef}
            className="hidden h-full lg:block"
        >
            <div
                ref={sidebarRef}
                className="will-change-transform"
            >
                <div className="rounded-2xl border-2 border-slate-200 bg-white/50 p-5 backdrop-blur-sm">
                    {projectListingContent}

                    <div className="my-5 border-t border-slate-200" />

                    {quickInsightsContent}
                </div>
            </div>
        </div>
    );
}