'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type KPI = {
    title: string;
    value: string;
    fullValue: string;
    change: string;
};

const kpis: KPI[] = [
    { title: 'Active Projects', value: '740', fullValue: '740', change: '+5' },
    { title: 'Funding', value: '$1.9B', fullValue: '$1,925,562,849.79', change: '+12.3%' },
    { title: 'Match Funding', value: '$8.3M', fullValue: '$836,055,614.76', change: '+8.2%' },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function KPICards() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-12 flex flex-col flex-wrap justify-between gap-8 md:flex-row md:gap-16"
        >
            {kpis.map((kpi, index) => (
                <motion.div
                    key={kpi.title}
                    variants={item}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex justify-start"
                >
                    <div className="inline-block">
                        <div
                            className="relative mb-3 inline-block"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
              <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 select-none font-bold leading-none tracking-tighter"
                  style={{
                      fontSize: 'clamp(6rem, 12vw, 10rem)',
                      transform: 'translate(10px, 10px)',
                      color: 'rgba(255,255,255,0.55)',
                      filter: 'blur(10px)',
                  }}
              >
                {kpi.value}
              </span>

                            <h3
                                className="relative inline-block cursor-default bg-gradient-to-b from-black to-black/60 bg-clip-text pr-2 font-bold leading-none tracking-tighter text-transparent"
                                style={{ fontSize: 'clamp(6rem, 12vw, 10rem)' }}
                            >
                                {kpi.value}
                            </h3>

                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                                className="absolute -right-2 -top-4 text-md font-bold text-emerald-500 md:-top-2 md:text-lg"
                            >
                                {kpi.change}
                            </motion.span>

                            <AnimatePresence>
                                {hoveredIndex === index && kpi.value !== kpi.fullValue && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute -bottom-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg"
                                    >
                                        {kpi.fullValue}
                                        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <p className="text-base text-slate-900 md:text-sm">{kpi.title}</p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}