'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, animate } from 'motion/react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

const GRADIENT_BORDER_STYLE: CSSProperties = {
    background: 'linear-gradient(to right, #0284c7, #059669, #e11d48) border-box',
    border: '2px solid transparent',
    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
};

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

const fmtFull = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

function Skeleton({ style, className }: { style?: React.CSSProperties; className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={`animate-pulse rounded-md bg-slate-200 inline-block ${className ?? ''}`}
            style={style}
        />
    );
}

function AnimatedValue({
                           value,
                           format,
                           delay = 0,
                       }: {
    value: number;
    format: (n: number) => string;
    delay?: number;
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

    return <>{display}</>;
}

const ACCENT_COLORS: Record<string, string> = {
    sky: '#0284c7',
    emerald: '#059669',
    rose: '#e11d48',
};

function StatCell({
                      label,
                      value,
                      sublabel,
                      accent,
                      loading,
                  }: {
    label: string;
    value: React.ReactNode;
    sublabel: string;
    accent: string;
    loading?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative px-3 pb-4 pt-4 sm:px-6 sm:py-7 lg:px-8"
        >
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '0.75rem',
                    height: '2px',
                    width: '1.5rem',
                    borderRadius: '9999px',
                    background: ACCENT_COLORS[accent],
                    opacity: 0.8,
                }}
            />

            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">
                {label}
            </p>

            <p
                className="mt-1 font-bold leading-none tracking-tight text-slate-900"
                style={{ fontSize: 'clamp(1.3rem, 5vw, 2.75rem)' }}
            >
                {loading ? (
                    <Skeleton style={{ width: '4.5rem', height: '2rem', borderRadius: '0.375rem', display: 'inline-block', verticalAlign: 'middle' }} />
                ) : (
                    value
                )}
            </p>

            <p className="mt-1.5 hidden truncate text-xs text-slate-400 sm:block">
                {loading ? (
                    <Skeleton style={{ width: '5rem', height: '0.625rem', borderRadius: '0.25rem', display: 'inline-block' }} />
                ) : (
                    sublabel
                )}
            </p>
        </motion.div>
    );
}

export function PortfolioSearchCard() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [data, setData] = useState<KPIData>({
        activeProjects: 0,
        funding: 0,
        matchFunding: 0,
    });
    const [kpiLoading, setKpiLoading] = useState(true);

    const [value, setValue] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [placeholderText, setPlaceholderText] = useState('projects, technologies, recipients...');

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const res = await fetch('/api/home/kpi');
                if (!res.ok) throw new Error('Failed');
                const json: KPIData = await res.json();
                setData(json);
            } catch {
            } finally {
                setKpiLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 640) {
                setPlaceholderText('');
            } else {
                setPlaceholderText('Project name, number, admin...');
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSubmit = () => {
        const trimmed = value.trim();
        setSubmitting(true);
        const params = new URLSearchParams();
        if (trimmed) params.set('search', trimmed);
        router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <div className="relative select-none overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] opacity-60"
                style={{ background: 'linear-gradient(to right, #0284c7, #059669, #e11d48)' }}
            />

            <div className="flex items-center border-b border-slate-200 bg-slate-50/60 px-4 py-3 sm:px-8 sm:py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[10px]">
                    EPIC database at a glance
                </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-200">
                <StatCell
                    label="Active Projects"
                    value={
                        <AnimatedValue
                            value={data.activeProjects}
                            format={(n) => Math.floor(n).toLocaleString()}
                        />
                    }
                    sublabel="In progress today"
                    accent="sky"
                    loading={kpiLoading}
                />
                <StatCell
                    label="Committed Funding"
                    value={
                        <AnimatedValue
                            value={data.funding}
                            format={abbreviate}
                            delay={0.1}
                        />
                    }
                    sublabel={data.funding > 0 ? fmtFull.format(floorTo(data.funding, 2)) : 'Ratepayer dollars'}
                    accent="emerald"
                    loading={kpiLoading}
                />
                <StatCell
                    label="Match Funding"
                    value={
                        <AnimatedValue
                            value={data.matchFunding}
                            format={abbreviate}
                            delay={0.2}
                        />
                    }
                    sublabel={
                        data.matchFunding > 0 ? fmtFull.format(floorTo(data.matchFunding, 2)) : 'Outside investment'
                    }
                    accent="rose"
                    loading={kpiLoading}
                />
            </div>

            <div className="border-t border-slate-200 bg-slate-50/40 px-4 pb-4 pt-3 sm:px-8 sm:pb-7 sm:pt-5">
                <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:mb-3 sm:text-[10px]">
                    Search the database
                </p>

                <motion.div
                    initial="rest"
                    animate={isFocused ? "active" : "rest"}
                    whileHover="active"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="group relative flex items-center overflow-hidden rounded-xl bg-white"
                >
                    <span className="absolute inset-0 rounded-xl border border-slate-200 transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0" />

                    <motion.span
                        className="pointer-events-none absolute inset-0 z-0 rounded-xl"
                        style={GRADIENT_BORDER_STYLE}
                        variants={{
                            rest: {
                                opacity: 0,
                                clipPath: 'polygon(0 0, 0 0, 0 0, 0 0, 0 0)',
                                transition: { duration: 0.2 },
                            },
                            active: {
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

                    <div className="relative z-10 flex items-center pl-3 text-slate-400 sm:pl-4">
                        <Search className="h-4 w-4 transition-colors group-focus-within:text-slate-600 group-hover:text-slate-600" />
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
                        placeholder={placeholderText}
                        className="select-none relative z-10 flex-1 truncate bg-transparent px-2.5 py-3 text-[1rem] text-slate-900 placeholder:text-slate-400 focus:outline-none sm:px-3 sm:py-4 sm:text-base"
                    />

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="relative z-10 mr-1.5 inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md disabled:opacity-60 sm:mr-2 sm:h-10 sm:px-5 sm:text-sm"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}