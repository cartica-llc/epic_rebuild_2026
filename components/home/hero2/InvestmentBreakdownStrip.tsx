'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, animate } from 'motion/react';

type KPIData = {
    activeProjects: number;
    funding: number;
    matchFunding: number;
};

const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
    if (n >= 1_000_000) return `$${fmt2(floorTo(n / 1_000_000, 1))}M`;
    if (n >= 1_000) return `$${fmt2(floorTo(n / 1_000, 1))}K`;
    return `$${Math.floor(n)}`;
}

function AnimatedValue({
                           value,
                           format,
                           delay = 0,
                           className,
                       }: {
    value: number;
    format: (n: number) => string;
    delay?: number;
    className?: string;
}) {
    const motionVal = useMotionValue(0);
    const [display, setDisplay] = useState(format(0));

    useEffect(() => {
        const unsub = motionVal.on('change', (v) => setDisplay(format(v)));
        const controls = animate(motionVal, value, {
            duration: 1.6,
            delay,
            ease: [0.0, 0.0, 0.2, 1],
        });
        return () => {
            controls.stop();
            unsub();
        };
    }, [value]);

    return <span className={className}>{display}</span>;
}

export function InvestmentBreakdownStrip() {
    const [data, setData] = useState<KPIData>({
        activeProjects: 0,
        funding: 0,
        matchFunding: 0,
    });

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const res = await fetch('/api/home/kpi');
                if (!res.ok) throw new Error('Failed');
                const json: KPIData = await res.json();
                setData(json);
            } catch {
            }
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 bg-slate-50/60 px-6 py-4 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    EPIC portfolio at a glance
                </p>

            </div>

            {/* Breakdown cells */}
            <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <BreakdownCell
                    label="Active Projects"
                    value={
                        <AnimatedValue
                            value={data.activeProjects}
                            format={(n) => Math.floor(n).toLocaleString()}
                            className="text-slate-900"
                        />
                    }
                    sublabel="In progress today"
                />
                <BreakdownCell
                    label="Committed Funding"
                    value={
                        <AnimatedValue
                            value={data.funding}
                            format={abbreviate}
                            delay={0.1}
                            className="text-slate-900"
                        />
                    }
                    sublabel={
                        data.funding > 0 ? fmt.format(data.funding) : 'Ratepayer dollars'
                    }
                />
                <BreakdownCell
                    label="Match Funding"
                    value={
                        <AnimatedValue
                            value={data.matchFunding}
                            format={abbreviate}
                            delay={0.2}
                            className="text-slate-900"
                        />
                    }
                    sublabel={
                        data.matchFunding > 0
                            ? fmt.format(data.matchFunding)
                            : 'Outside investment'
                    }
                />
            </div>

            {/* Footer CTA */}
            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50/60 px-6 py-3 sm:px-8">
                <Link
                    href="/projects"
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
                >
                    See all breakdowns
                    <span className="transition-transform group-hover:translate-x-0.5">
                        →
                    </span>
                </Link>
            </div>
        </div>
    );
}

function BreakdownCell({
                           label,
                           value,
                           sublabel,
                       }: {
    label: string;
    value: React.ReactNode;
    sublabel: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="px-6 py-6 sm:px-8 sm:py-7"
        >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap text-slate-500">
                {label}
            </p>
            <p
                className="mt-2 font-bold leading-none tracking-tight"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
            >
                {value}
            </p>
            <p className="mt-2 truncate text-xs text-slate-500">{sublabel}</p>
        </motion.div>
    );
}