'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';

type KPIData = {
    activeProjects: number;
    funding:        number;
    matchFunding:   number;
};

type KPI = {
    title:     string;
    value:     number;
    fullValue: string;
    format:    (n: number) => string;
};

const fmt = new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

function floorTo(n: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(n * factor) / factor;
}

function fmt2(n: number): string {
    return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function abbreviate(n: number): string {
    if (n >= 1_000_000_000) return `$${fmt2(floorTo(n / 1_000_000_000, 1))}B`;
    if (n >= 1_000_000)     return `$${fmt2(floorTo(n / 1_000_000, 1))}M`;
    if (n >= 1_000)         return `$${fmt2(floorTo(n / 1_000, 1))}K`;
    return `$${Math.floor(n)}`;
}

function buildKPIs(data: KPIData): KPI[] {
    return [
        {
            title:     'Active Projects',
            value:     data.activeProjects,
            fullValue: Math.floor(data.activeProjects).toLocaleString(),
            format:    (n) => Math.floor(n).toLocaleString(),
        },
        {
            title:     'Committed Funding',
            value:     data.funding,
            fullValue: fmt.format(Math.floor(data.funding)),
            format:    abbreviate,
        },
        {
            title:     'Match Funding',
            value:     data.matchFunding,
            fullValue: fmt.format(Math.floor(data.matchFunding)),
            format:    abbreviate,
        },
    ];
}

const DURATION = 4.5;

function AnimatedNumber({
                            value,
                            format,
                            index = 0,
                            className,
                            style,
                        }: {
    value:      number;
    format:     (n: number) => string;
    index?:     number;
    className?: string;
    style?:     React.CSSProperties;
}) {
    const motionVal             = useMotionValue(0);
    const [display, setDisplay] = useState(format(0));

    useEffect(() => {
        const unsub    = motionVal.on('change', (v) => setDisplay(format(v)));
        const controls = animate(motionVal, value, {
            duration: DURATION,
            delay:    index * DURATION,
            ease:     [0.0, 0.0, 0.2, 1],
        });
        return () => { controls.stop(); unsub(); };
    }, [value]);

    return <span className={className} style={style}>{display}</span>;
}

const container = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0 },
};

export function KPICards() {
    const [data, setData]                 = useState<KPIData>({ activeProjects: 0, funding: 0, matchFunding: 0 });
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const res = await fetch('/api/home/kpi');
                if (!res.ok) throw new Error('Failed');
                const json: KPIData = await res.json();
                setData(json);
            } catch {
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const kpis = buildKPIs(data);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-12 flex flex-col justify-between gap-8 xl:flex-row md:gap-16"
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
                            {/* blur ghost */}
                            <AnimatedNumber
                                value={kpi.value}
                                format={kpi.format}
                                index={index}
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 select-none font-bold leading-none tracking-tighter"
                                style={{
                                    fontSize:  'clamp(6rem, 12vw, 10rem)',
                                    transform: 'translate(10px, 10px)',
                                    color:     'rgba(255,255,255,0.55)',
                                    filter:    'blur(10px)',
                                }}
                            />

                            {/* main value */}
                            <AnimatedNumber
                                value={kpi.value}
                                format={kpi.format}
                                index={index}
                                className="relative inline-block cursor-default bg-gradient-to-b from-black to-black/60 bg-clip-text pr-2 font-bold leading-none tracking-tighter text-transparent"
                                style={{ fontSize: 'clamp(6rem, 12vw, 10rem)' }}
                            />

                            <AnimatePresence>
                                {hoveredIndex === index && (
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