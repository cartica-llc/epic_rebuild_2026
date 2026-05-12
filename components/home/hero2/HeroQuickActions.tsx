'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
    TrendingUp,
    Lightbulb,
    MapPin,
    Rocket,
} from 'lucide-react';

type Action = {
    label: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
};

const actions: Action[] = [
    {
        label: 'How is funding being spent?',
        description: 'Committed vs. expended over time',
        href: '/projects?view=spending',
        icon: TrendingUp,
    },
    {
        label: 'What have projects learned?',
        description: 'Search outcomes and findings',
        href: '/projects?view=technology',
        icon: Lightbulb,
    },
    {
        label: 'What projects are near me?',
        description: 'Filter by district or service area',
        href: '/projects?view=map',
        icon: MapPin,
    },
    {
        label: 'What is close to market?',
        description: 'Maturity & commercialization signals',
        href: '/projects?view=market',
        icon: Rocket,
    },
];

export function HeroQuickActions() {
    return (
        <div>
            <div className="mb-4 flex items-baseline justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Start exploring
                </p>
                {/*<Link*/}
                {/*    href="/projects"*/}
                {/*    className="text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"*/}
                {/*>*/}
                {/*    View all →*/}
                {/*</Link>*/}
            </div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={{
                    visible: { transition: { staggerChildren: 0.06 } },
                }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
            >
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <motion.div
                            key={action.label}
                            variants={{
                                hidden: { opacity: 0, y: 12 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <Link
                                href={action.href}
                                className="group flex h-full items-start gap-3 rounded-lg border border-slate-200 bg-white/80 px-4 py-3.5 backdrop-blur-sm transition-all hover:border-slate-900 hover:bg-white hover:shadow-sm"
                            >
                                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                                    <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold leading-snug text-slate-900">
                                        {action.label}
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                                        {action.description}
                                    </span>
                                </span>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
