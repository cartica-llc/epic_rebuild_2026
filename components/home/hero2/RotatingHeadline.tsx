'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type InvestmentAreaRow = {
    id: number | string;
    name: string;
    funding: number;
    projectCount?: number;
};

type InvestmentAreasResponse = {
    areas?: InvestmentAreaRow[];
    totalFunding?: number;
    total?: number;
};

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

const FALLBACK_LENSES: Lens[] = [
    {
        amount: '—',
        fullAmount: '—',
        label: 'clean energy research',
    },
];

export function RotatingHeadline() {
    const [lenses, setLenses] = useState<Lens[]>(FALLBACK_LENSES);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetch('/api/home/investmentAreasTreeMap')
            .then((r) => r.json())
            .then((json: InvestmentAreasResponse | InvestmentAreaRow[]) => {
                if (cancelled) return;
                const rows = Array.isArray(json) ? json : json.areas ?? [];
                if (!rows.length) return;

                const next: Lens[] = rows
                    .filter((r) => r && Number.isFinite(r.funding) && r.funding > 0)
                    .sort((a, b) => b.funding - a.funding)
                    .slice(0, TOP_N)
                    .map((r) => ({
                        amount: abbreviate(r.funding),
                        fullAmount: fmt.format(Math.floor(r.funding)),
                        label: normalizeLabel(r.name),
                    }));

                if (next.length) setLenses(next);
            })
            .catch(() => {
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (paused || lenses.length <= 1) return;
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % lenses.length);
        }, ROTATE_MS);
        return () => clearInterval(id);
    }, [paused, lenses.length]);

    const safeIndex = lenses.length > 0 ? index % lenses.length : 0;
    const current = lenses[safeIndex] ?? FALLBACK_LENSES[0];

    const longestLabel = lenses.reduce(
        (longest, lens) =>
            lens.label.length > longest.label.length ? lens : longest,
        lenses[0] ?? FALLBACK_LENSES[0],
    );

    return (
        <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <h1
                className="font-bold leading-[1.05] tracking-tight text-slate-900"
                style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)' }}
            >
                <span className="block">California has committed</span>

                <span className="relative mt-1 block" style={{ lineHeight: 1.1 }}>
                    <span aria-hidden="true" className="invisible block">
                        <span>{longestLabel.amount}</span>
                        <span className="ml-3 mr-3 font-normal">in</span>
                        <span>
                            {longestLabel.label}
                            <span className="ml-2 inline-block" style={{ width: '0.7em' }} />
                        </span>
                    </span>

                    <span className="absolute inset-0">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={`line-${safeIndex}`}
                                initial={{ opacity: 0, y: '0.3em', filter: 'blur(6px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: '-0.3em', filter: 'blur(6px)' }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0"
                                title={current.fullAmount}
                            >
                                <span className="text-slate-900">{current.amount}</span>
                                <span className="ml-3 mr-3 font-normal text-slate-400">in</span>
                                <span
                                    className="text-slate-600"
                                    style={{
                                        backgroundImage:
                                            'linear-gradient(to right, rgba(2, 132, 199, 0.7), rgba(5, 150, 105, 0.7), rgba(225, 29, 72, 0.7))',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '40% 3px',
                                        backgroundPosition: '100% 100%',
                                        paddingBottom: '0.12em',
                                        boxDecorationBreak: 'clone',
                                        WebkitBoxDecorationBreak: 'clone',
                                    }}
                                >
                                    {current.label}
                                </span>

                                <TrailingStar />
                            </motion.span>
                        </AnimatePresence>
                    </span>
                </span>
            </h1>
        </div>
    );
}


function TrailingStar() {
    return (
        <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.3, rotate: -60 }}
            animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
            }}
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