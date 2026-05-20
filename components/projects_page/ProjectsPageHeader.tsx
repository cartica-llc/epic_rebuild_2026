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
        <section className="select-none relative z-30 mb-10">
            <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
                <div className="relative px-5 py-6 md:px-6">
                    <div className="pointer-events-none absolute right-6 top-5 hidden h-24 w-24 rounded-full bg-slate-100/80 blur-2xl md:block" />

                    <div className="relative min-w-0">
                        <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-slate-300" />

                            <p className="text-xs font-bold uppercase tracking-[0.20em] text-slate-500">
                                {activeContent.eyebrow}
                            </p>
                        </span>

                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-3xl">
                            {activeContent.title}
                        </h1>

                        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 md:text-sm">
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