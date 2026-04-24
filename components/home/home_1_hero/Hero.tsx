'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { HeroChart } from './HeroChart';
import { KPICards } from './KPICards';
import { SearchAndFilter } from './SearchAndFilter';

export function Hero() {
    const { scrollY } = useScroll();
    const logoOpacity = useTransform(scrollY, [0, 200], [1, 0]);
    const logoY = useTransform(scrollY, [0, 200], [0, -50]);

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative min-h-screen w-full bg-white"
        >
            <div className="absolute inset-0 z-0">
                <HeroChart />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
                    <motion.div style={{ opacity: logoOpacity, y: logoY }}>
                        <Image
                            src="/logo/CAgov-logo.svg"
                            alt="California Government Logo"
                            width={220}
                            height={220}
                            priority
                            className="h-[clamp(3rem,20vw,13rem)] w-auto object-contain"
                        />
                    </motion.div>
                </div>

                <div className="px-4 pb-8 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl">
                        <KPICards />
                        <SearchAndFilter />
                    </div>
                </div>
            </div>
        </motion.section>
    );
}