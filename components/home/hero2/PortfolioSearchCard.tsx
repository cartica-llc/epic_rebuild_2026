'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, animate } from 'motion/react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';


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
    }, [value, format, delay, motionVal]);

    return <span className={className}>{display}</span>;
}


export function PortfolioSearchCard() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [data, setData] = useState<KPIData>({
        activeProjects: 0,
        funding: 0,
        matchFunding: 0,
    });

    const [value, setValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const handleSubmit = () => {
        const trimmed = value.trim();

        setSubmitting(true);

        const params = new URLSearchParams();
        if (trimmed) params.set('search', trimmed);

        router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Top brand gradient hairline */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600 opacity-60"
            />

            {/* Header band */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/60 px-6 py-4 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]    text-slate-500">
                    EPIC database at a glance
                </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <StatCell
                    label="Active Projects"
                    value={
                        <AnimatedValue
                            value={data.activeProjects}
                            format={(n) => Math.floor(n).toLocaleString()}
                            className="text-slate-900"
                        />
                    }
                    sublabel="In progress today"
                    accent="sky"
                />

                <StatCell
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
                    accent="emerald"
                />

                <StatCell
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
                    accent="rose"
                />
            </div>

            {/* Divider with label */}
            <div className="relative border-t border-slate-200 bg-slate-50/40 px-6 pt-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Search this portfolio
                </p>
            </div>

            {/* Search row */}
            <div className="bg-slate-50/40 px-6 pb-6 pt-3 sm:px-8 sm:pb-7">
                <div className="group relative flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-slate-400 focus-within:shadow-md">
                    <div className="flex items-center pl-4 text-slate-400">
                        <Search className="h-5 w-5" />
                    </div>

                    <input
                        id="portfolio-search"
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmit();
                        }}
                        placeholder="Search projects, technologies, recipients, or locations..."
                        className="flex-1 bg-transparent px-3 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 sm:px-6"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <span className="hidden sm:inline">Search</span>
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

const ACCENT_MAP = {
    sky: 'before:bg-sky-600',
    emerald: 'before:bg-emerald-600',
    rose: 'before:bg-rose-600',
} as const;

function StatCell({
                      label,
                      value,
                      sublabel,
                      accent,
                  }: {
    label: string;
    value: React.ReactNode;
    sublabel: string;
    accent: keyof typeof ACCENT_MAP;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`relative px-6 py-6 sm:px-8 sm:py-7 before:absolute before:left-6 before:top-0 before:h-[2px] before:w-8 before:rounded-full before:opacity-70 sm:before:left-8 ${ACCENT_MAP[accent]}`}
        >
            <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
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