'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    TrendingUp,
    Lightbulb,
    MapPin,
    Rocket,
} from 'lucide-react';

const GRADIENT_BORDER_STYLE: CSSProperties = {
    background: 'linear-gradient(to right, #0284c7, #059669, #e11d48)',
    padding: '2px', // This defines the border thickness
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
};

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
            <div className=" select-none mb-4 flex items-baseline justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Start exploring
                </p>
            </div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={{
                    visible: { transition: { staggerChildren: 0.06 } },
                }}
                className="select-none grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
            >
                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <motion.div
                            key={action.label}
                            // 1. Grid entrance variants (isolated here)
                            variants={{
                                hidden: { opacity: 0, y: 12 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            {/* 2. Hover state wrapper (isolated here so it doesn't fight the grid) */}
                            <motion.div
                                initial="rest"
                                animate="rest"
                                whileHover="hover"
                                className="h-full"
                            >
                                <Link
                                    href={action.href}
                                    className="group relative flex h-full items-start gap-3 overflow-hidden rounded-lg bg-white/80 px-4 py-3.5 backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm"
                                >
                                    {/* Default Gray Border */}
                                    <span className="absolute inset-0 rounded-lg border border-slate-200 transition-opacity duration-200 group-hover:opacity-0" />

                                    {/* Animated Gradient Border */}
                                    <motion.span
                                        className="pointer-events-none absolute inset-0 rounded-lg"
                                        style={GRADIENT_BORDER_STYLE}
                                        variants={{
                                            rest: {
                                                opacity: 0,
                                                clipPath: 'polygon(0 0, 0 0, 0 0, 0 0, 0 0)',
                                                transition: { duration: 0.2 },
                                            },
                                            hover: {
                                                opacity: 1,
                                                clipPath: [
                                                    'polygon(0 0, 0 0, 0 0, 0 0, 0 0)',
                                                    'polygon(0 0, 100% 0, 100% 0, 100% 0, 100% 0)',
                                                    'polygon(0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%)',
                                                    'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 100%)',
                                                    'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0)',
                                                ],
                                                transition: {
                                                    duration: 0.5,
                                                    ease: 'linear',
                                                },
                                            },
                                        }}
                                    />

                                    {/* Foreground Content */}
                                    <span className="relative z-10 mt-0.5 inline-flex h-7 w-7  items-center justify-center  bg-slate-100 text-slate-600 ">
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>

                                    <span className="relative z-10 min-w-0 flex-1">
                                        <span className="block text-sm font-semibold leading-snug text-slate-900">
                                            {action.label}
                                        </span>
                                        <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                                            {action.description}
                                        </span>
                                    </span>
                                </Link>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}