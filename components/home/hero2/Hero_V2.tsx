'use client';

import { motion } from 'motion/react';
import { HeroChart } from '@/components/home/home_1_hero/HeroChart';
import { RotatingHeadline } from './RotatingHeadline';
import { PortfolioSearchCard } from './PortfolioSearchCard';
import { HeroQuickActions } from './HeroQuickActions';

export function Hero_V2() {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full overflow-hidden bg-white pt-10 "
        >
            {/* Background chart - decorative */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-85">
                <HeroChart />
            </div>

            {/* Top accent line - subtle brand gradient */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-sky-600/40 to-transparent"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-emerald-600/30 to-rose-600/30"
                aria-hidden="true"
            />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8 lg:pb-20 lg:pt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <RotatingHeadline />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="mt-8  max-w-2xl text-lg leading-relaxed text-slate-600"
                >
                    The Electric Program Investment Charge (EPIC) is a ratepayer-funded initiative driving breakthrough research, development, and deployment of clean energy solutions across California.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-12"
                >
                    <PortfolioSearchCard />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.65 }}
                    className="mt-12"
                >
                    <HeroQuickActions />
                </motion.div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </motion.section>
    );
}