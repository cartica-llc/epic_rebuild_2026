'use client';

import {
    BarChart3,
    TrendingUp,
    Lightbulb,
    Map as MapIcon,
    FolderKanban,
} from 'lucide-react';
import { ProjectsMobileToggle } from './ProjectsMobileToggle';

type HeaderContent = {
    title: string;
    description: string;
    eyebrow: string;
    icon: React.ElementType;
};

const HEADER_CONTENT: Record<string, HeaderContent> = {
    spending: {
        title: 'Spending Analysis',
        eyebrow: 'Funding View',
        description:
            'Explore EPIC spending across time, administrators, plan periods, and investment areas.',
        icon: BarChart3,
    },
    market: {
        title: 'Market Maturity',
        eyebrow: 'Readiness View',
        description:
            'See where projects are in development and which ones show signs of being close to market.',
        icon: TrendingUp,
    },
    technology: {
        title: 'Technology & Learnings',
        eyebrow: 'Learning View',
        description:
            'Search similar EPIC projects by topic, innovation, or barrier.',
        icon: Lightbulb,
    },
    map: {
        title: 'Project Map',
        eyebrow: 'Geography View',
        description:
            'Explore projects by location and see funding distribution across regions.',
        icon: MapIcon,
    },
};

const DEFAULT_HEADER: HeaderContent = {
    title: 'All Projects',
    eyebrow: 'Project Database',
    description:
        'Browse the complete list of EPIC projects and discover quick insights.',
    icon: FolderKanban,
};

interface ProjectsPageHeaderProps {
    viewParam: string | null;
    activePrefilter: string;
    onPrefilterChange: (next: string) => void;
}

export function ProjectsPageHeader({
                                       viewParam,
                                       activePrefilter,
                                       onPrefilterChange,
                                   }: ProjectsPageHeaderProps) {
    const activeContent =
        viewParam && HEADER_CONTENT[viewParam]
            ? HEADER_CONTENT[viewParam]
            : DEFAULT_HEADER;

    const Icon = activeContent.icon;

    return (
        <section className="relative z-30 mb-5 sm:mb-10 select-none">
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
                <div className="absolute left-0 top-0 hidden h-full w-[5px] bg-gradient-to-b from-sky-600 via-emerald-600 to-rose-600 lg:block" />

                <div className="relative px-4 py-4 sm:px-6 sm:py-6 lg:pl-8">
                    <div className="pointer-events-none absolute right-6 top-5 hidden h-24 w-24 rounded-full bg-slate-100/80 blur-2xl md:block" />

                    <div className="relative min-w-0">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                            {/* Dropped mobile icon size down to h-3 w-3 */}
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-300" />

                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.20em] text-slate-500">
                                {activeContent.eyebrow}
                            </p>
                        </span>

                        <h1 className="mt-1.5 sm:mt-4 text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-950">
                            {activeContent.title}
                        </h1>

                        <p className="mt-1.5 sm:mt-3 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">
                            {activeContent.description}
                        </p>
                    </div>
                </div>

                <ProjectsMobileToggle
                    activePrefilter={activePrefilter}
                    onPrefilterChange={onPrefilterChange}
                />
            </div>
        </section>
    );
}