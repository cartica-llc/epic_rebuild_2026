'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInvestmentAreas } from '@/hooks/useInvestmentAreas';

type Lens = {
    amount: string;
    fullAmount: string;
    label: string;
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

function normalizeLabel(name: string): string {
    return name.trim().toLowerCase();
}

const ROTATE_MS = 3600;
const TOP_N = 6;
const MAX_LABEL_WORDS = 4;

export function RotatingHeadline() {
    const { data } = useInvestmentAreas();

    const [lenses, setLenses] = useState<Lens[]>([]);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const rows = data?.areas ?? [];
        if (!rows.length) return;

        const next: Lens[] = rows
            .filter((r) => r && Number.isFinite(r.funding) && r.funding > 0)
            .sort((a, b) => b.funding - a.funding)
            .slice(0, TOP_N)
            .map((r) => ({
                amount: abbreviate(r.funding),
                fullAmount: fmt.format(Math.floor(r.funding)),
                label: normalizeLabel(r.name)
                    .split(' ')
                    .slice(0, MAX_LABEL_WORDS)
                    .join(' '),
            }));

        if (next.length) setLenses(next);
    }, [data]);

    useEffect(() => {
        if (paused || lenses.length <= 1) return;
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % lenses.length);
        }, ROTATE_MS);
        return () => clearInterval(id);
    }, [paused, lenses.length]);

    const hasData = lenses.length > 0;
    const safeIndex = hasData ? index % lenses.length : 0;
    const current = hasData ? lenses[safeIndex] : null;

    const longestLabel = hasData
        ? lenses.reduce(
            (longest, lens) =>
                lens.label.length > longest.label.length ? lens : longest,
            lenses[0],
        )
        : null;

    return (
        <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="w-full min-w-0 select-none"
        >
            <h1
                className="w-full min-w-0 font-bold leading-[1.05] tracking-tight text-slate-900"
                style={{
                    fontSize: 'clamp(0.95rem, 4vw, 3.25rem)',
                }}
            >
                <span className="block">California has committed</span>

                <span
                    className="relative mt-1 block w-full min-w-0"
                    style={{ lineHeight: 1.1 }}
                >
                    {longestLabel ? (
                        <span
                            aria-hidden="true"
                            className="invisible block w-full whitespace-nowrap"
                        >
                            <span>{longestLabel.amount}</span>
                            <span className="ml-3 mr-3 font-normal">in</span>
                            <span>
                                {longestLabel.label}
                                <span
                                    className="ml-2 inline-block"
                                    style={{ width: '0.7em' }}
                                />
                            </span>
                        </span>
                    ) : (
                        <span aria-hidden="true" className="invisible block">
                            placeholder
                        </span>
                    )}

                    <span className="absolute inset-0 w-full whitespace-nowrap">
                        <AnimatePresence mode="wait">
                            {current && (
                                <motion.span
                                    key={`line-${safeIndex}`}
                                    initial={{
                                        opacity: 0,
                                        y: '0.3em',
                                        filter: 'blur(6px)',
                                    }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{
                                        opacity: 0,
                                        y: '-0.3em',
                                        filter: 'blur(6px)',
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="absolute inset-0 block w-full"
                                    title={current.fullAmount}
                                >
                                    <span className="text-slate-900">{current.amount}</span>
                                    <span className="ml-3 mr-3 font-normal text-slate-400">
                                        in
                                    </span>
                                    <LabelWithLastLineUnderline label={current.label} />
                                    <TrailingStar />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </span>
                </span>
            </h1>
        </div>
    );
}

function LabelWithLastLineUnderline({ label }: { label: string }) {
    const parts = label.split(' ');
    const lastWord = parts[parts.length - 1] ?? '';
    const head = parts.slice(0, -1).join(' ');

    return (
        <span className="text-slate-600">
            {head && <>{head} </>}
            <span
                className="whitespace-nowrap"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(2, 132, 199, 0.7), rgba(5, 150, 105, 0.7), rgba(225, 29, 72, 0.7))',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100% 3px',
                    backgroundPosition: '0 100%',
                    paddingBottom: '0.12em',
                }}
            >
                {lastWord}
            </span>
        </span>
    );
}

function TrailingStar() {
    return (
        <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.3, rotate: -60 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.25,
            }}
            className="ml-2 inline-block align-middle"
            style={{ width: '0.55em', height: '0.55em' }}
        >
            <svg
                viewBox="0 0 224 212"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
            >
                <path
                    d="M140,80L112,0l-28,80H0l68,52-24,80,68-52,68,52-24-80,68-52h-84Z"
                    fill="#e11d48"
                />
            </svg>
        </motion.span>
    );
}