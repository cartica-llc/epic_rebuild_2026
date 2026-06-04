'use client';

import { useMemo, useState, useEffect } from 'react';
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

const ROTATE_MS = 4000;
const TOP_N = 6;
const MAX_LABEL_WORDS = 4;

const MOBILE_COMMITTED_SIZE = '1.75rem';
const MOBILE_AMOUNT_SIZE    = '4.25rem';
const MOBILE_LABEL_SIZE = 'clamp(0.90rem, 3.75dvw, 1.85rem)';

const DESKTOP_COMMITTED_SIZE = 'clamp(1.75rem, 2.8vw, 2.5rem)';
const DESKTOP_AMOUNT_SIZE    = 'clamp(4rem, 6vw, 5.25rem)';
const DESKTOP_LABEL_SIZE     = 'clamp(1.2rem, 1.8vw, 1.6rem)';

function Skeleton({ style, className }: { style?: React.CSSProperties; className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={`animate-pulse rounded-lg bg-slate-200 inline-block ${className ?? ''}`}
            style={style}
        />
    );
}

function EyebrowBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="pt-6 mb-6 inline-flex items-center gap-1.5"
        >
            <motion.span
                transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, delay: 0.6 }}
                className="inline-block h-[7px] w-[7px] rounded-full bg-emerald-700"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                EPIC Database
            </span>
        </motion.div>
    );
}

function CommittedHeading({ fontSize }: { fontSize: string }) {
    return (
        <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            style={{
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                fontSize,
                fontWeight: 600,
                color: 'rgb(145, 148, 154)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
            }}
        >
            California has
            <br />
            committed
        </motion.h1>
    );
}

function AnimatedAmount({
                            amount,
                            fullAmount,
                            safeIndex,
                            fontSize,
                        }: {
    amount: string;
    fullAmount: string;
    safeIndex: number;
    fontSize: string;
}) {
    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={`amount-${safeIndex}`}
                initial={{ opacity: 0, y: '0.2em', filter: 'blur(5px)', scale: 0.97 }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, y: '-0.15em', filter: 'blur(5px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                title={fullAmount}
                style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize,
                    fontWeight: 400,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    color: '#0f172a',
                    display: 'block',
                }}
            >
                {amount}
            </motion.span>
        </AnimatePresence>
    );
}

function AnimatedLabel({
                           label,
                           safeIndex,
                           fontSize,
                       }: {
    label: string;
    safeIndex: number;
    fontSize: string;
}) {
    const words = label.split(' ');
    const lastWord = words[words.length - 1] ?? '';
    const head = words.slice(0, -1).join(' ');

    const outerStyle: React.CSSProperties = {
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        fontSize,
        fontWeight: 500,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        color: 'rgb(145, 148, 154)',
    };

    const lastWordStyle: React.CSSProperties = {
        backgroundImage:
            'linear-gradient(90deg, rgba(2,132,199,0.6), rgba(5,150,105,0.6), rgba(225,29,72,0.6))',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 2.5px',
        backgroundPosition: '0 100%',
        paddingBottom: '0.1em',
    };

    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={`label-${safeIndex}`}
                initial={{ opacity: 0, y: '0.4em', filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: '-0.3em', filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={outerStyle}
            >
                {head && <>{head} </>}
                <span className="whitespace-nowrap" style={lastWordStyle}>
                    {lastWord}
                    <motion.span
                        aria-hidden="true"
                        initial={{ opacity: 0, scale: 0.3, rotate: -60 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
                        style={{
                            display: 'inline-block',
                            width: '0.55em',
                            height: '0.55em',
                            marginLeft: '0.35em',
                            verticalAlign: 'middle',
                            position: 'relative',
                            bottom: '0.1em',
                        }}
                    >
                        <svg viewBox="0 0 224 212" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                            <path
                                d="M140,80L112,0l-28,80H0l68,52-24,80,68-52,68,52-24-80,68-52h-84Z"
                                fill="#e11d48"
                            />
                        </svg>
                    </motion.span>
                </span>
            </motion.span>
        </AnimatePresence>
    );
}

function ProgressBar({ rotateMs }: { rotateMs: number }) {
    return (
        <div className="h-px w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
                className="h-full rounded-full"
                style={{
                    background: 'linear-gradient(90deg, #0284c7 0%, #059669 50%, #e11d48 100%)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: rotateMs / 1000, ease: 'linear' }}
            />
        </div>
    );
}

function LensList({
                      lenses,
                      active,
                      rotateMs,
                      onSelect,
                  }: {
    lenses: Lens[];
    active: number;
    rotateMs: number;
    onSelect: (i: number) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="hidden w-52 shrink-0 lg:block xl:w-60"
        >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Top investment areas
            </p>
            <ul role="list" className="flex flex-col">
                {lenses.map((lens, i) => {
                    const isActive = i === active;
                    return (
                        <li key={i}>
                            <button
                                onClick={() => onSelect(i)}
                                aria-current={isActive ? 'true' : undefined}
                                className="flex w-full items-center gap-2.5 py-2 text-left"
                            >
                                <span
                                    className="h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300"
                                    style={{
                                        background: isActive ? '#0f172a' : '#cbd5e1',
                                        transform: isActive ? 'scale(1.4)' : 'scale(1)',
                                    }}
                                />
                                <span
                                    className="truncate text-sm transition-colors duration-200"
                                    style={{
                                        fontWeight: isActive ? 500 : 400,
                                        color: isActive ? '#0f172a' : '#94a3b8',
                                    }}
                                >
                                    {lens.label}
                                </span>
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -4 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-auto shrink-0 text-xs tabular-nums text-slate-900"
                                            title={lens.fullAmount}
                                        >
                                            {lens.amount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                            {isActive && (
                                <div className="mb-1 pl-4">
                                    <ProgressBar rotateMs={rotateMs} />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </motion.div>
    );
}

function LensListSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="hidden w-52 shrink-0 lg:block xl:w-60"
            aria-hidden="true"
        >
            <Skeleton style={{ width: '7rem', height: '0.625rem', marginBottom: '0.75rem', borderRadius: '0.25rem', display: 'block' }} />
            {Array.from({ length: TOP_N }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2">
                    <Skeleton style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', flexShrink: 0 }} />
                    <Skeleton style={{ width: `${5 + (i % 3) * 2}rem`, height: '0.75rem', borderRadius: '0.25rem' }} />
                </div>
            ))}
        </motion.div>
    );
}

function DotNav({
                    count,
                    active,
                    onSelect,
                }: {
    count: number;
    active: number;
    onSelect: (i: number) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="flex flex-col items-center gap-1.5 lg:hidden"
        >
            {Array.from({ length: count }).map((_, i) => (
                <button
                    key={i}
                    aria-label={`Go to item ${i + 1}`}
                    onClick={() => onSelect(i)}
                    className="w-1.5 rounded-full transition-all duration-300"
                    style={{
                        height: i === active ? '20px' : '6px',
                        background: i === active ? '#0f172a' : '#cbd5e1',
                    }}
                />
            ))}
        </motion.div>
    );
}

export function RotatingHeadline() {
    const { data } = useInvestmentAreas();

    const lenses = useMemo<Lens[]>(() => {
        const rows = data?.areas ?? [];
        return rows
            .filter((r) => r && Number.isFinite(r.funding) && r.funding > 0)
            .sort((a, b) => b.funding - a.funding)
            .slice(0, TOP_N)
            .map((r) => ({
                amount: abbreviate(r.funding),
                fullAmount: fmt.format(Math.floor(r.funding)),
                label: normalizeLabel(r.name).split(' ').slice(0, MAX_LABEL_WORDS).join(' '),
            }));
    }, [data]);

    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || lenses.length <= 1) return;
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % lenses.length);
        }, ROTATE_MS);
        return () => clearInterval(id);
    }, [paused, lenses.length]);

    // const loading = isLoading ?? !data;
    const hasData = lenses.length > 0;
    const safeIndex = hasData ? index % lenses.length : 0;
    const current = hasData ? lenses[safeIndex] : null;

    const longestLabel = hasData
        ? lenses.reduce((a, b) => (b.label.length > a.label.length ? b : a), lenses[0])
        : null;

    function handleSelect(i: number) {
        setIndex(i);
        setPaused(true);
        setTimeout(() => setPaused(false), 8000);
    }

    return (
        <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="w-full min-w-0 select-none"
        >
            <EyebrowBadge />

            <div className="flex items-start gap-12 lg:gap-16">
                <div className="flex min-w-0 flex-1 items-center justify-between lg:block">
                    <div className="min-w-0 flex-1">
                        <div className="mb-3">
                            <span className="lg:hidden">
                                <CommittedHeading fontSize={MOBILE_COMMITTED_SIZE} />
                            </span>
                            <span className="hidden lg:block">
                                <CommittedHeading fontSize={DESKTOP_COMMITTED_SIZE} />
                            </span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
                            className="relative mb-3"
                        >
                            {current ? (
                                <>
                                    <span className="lg:hidden">
                                        <AnimatedAmount
                                            amount={current.amount}
                                            fullAmount={current.fullAmount}
                                            safeIndex={safeIndex}
                                            fontSize={MOBILE_AMOUNT_SIZE}
                                        />
                                    </span>
                                    <span className="hidden lg:block">
                                        <AnimatedAmount
                                            amount={current.amount}
                                            fullAmount={current.fullAmount}
                                            safeIndex={safeIndex}
                                            fontSize={DESKTOP_AMOUNT_SIZE}
                                        />
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Skeleton
                                        className="lg:hidden"
                                        style={{ width: '7rem', height: '4.25rem', borderRadius: '0.5rem', display: 'block' }}
                                    />
                                    <Skeleton
                                        className="hidden lg:block"
                                        style={{ width: '10rem', height: '5.25rem', borderRadius: '0.5rem', display: 'block' }}
                                    />
                                </>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.34 }}
                            className="relative w-full"
                        >
                            {longestLabel && (
                                <span
                                    aria-hidden="true"
                                    className="invisible flex items-baseline gap-2"
                                >
                                    <span
                                        className="shrink-0 font-light uppercase tracking-widest"
                                        style={{ fontSize: '0.7rem', color: 'rgb(145, 148, 154)' }}
                                    >
                                        in
                                    </span>
                                    <span
                                        style={{
                                            fontSize: MOBILE_LABEL_SIZE,
                                            fontWeight: 500,
                                            paddingBottom: '0.1em',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {(() => {
                                            const words = longestLabel.label.split(' ');
                                            const last = words[words.length - 1] ?? '';
                                            const head = words.slice(0, -1).join(' ');
                                            return (
                                                <>
                                                    {head && <>{head} </>}
                                                    <span className="whitespace-nowrap">
                                                        {last}
                                                        <span style={{ display: 'inline-block', width: '0.55em', marginLeft: '0.35em' }} />
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </span>
                                </span>
                            )}

                            <span className="absolute inset-0 flex items-baseline gap-2">
                                <span
                                    className="shrink-0 font-light uppercase tracking-widest"
                                    style={{ fontSize: '0.7rem', color: 'rgb(145, 148, 154)' }}
                                >
                                    in
                                </span>

                                <span className="relative min-w-0 lg:hidden">
                                    {current ? (
                                        <AnimatedLabel
                                            label={current.label}
                                            safeIndex={safeIndex}
                                            fontSize={MOBILE_LABEL_SIZE}
                                        />
                                    ) : (
                                        <Skeleton style={{ width: '9rem', height: '1.5rem', borderRadius: '0.375rem', display: 'block' }} />
                                    )}
                                </span>
                                <span className="relative hidden min-w-0 lg:inline">
                                    {current ? (
                                        <AnimatedLabel
                                            label={current.label}
                                            safeIndex={safeIndex}
                                            fontSize={DESKTOP_LABEL_SIZE}
                                        />
                                    ) : (
                                        <Skeleton style={{ width: '12rem', height: '1.75rem', borderRadius: '0.375rem', display: 'block' }} />
                                    )}
                                </span>
                            </span>
                        </motion.div>
                    </div>

                    {hasData && (
                        <div className="ml-6 shrink-0 lg:hidden">
                            <DotNav count={lenses.length} active={safeIndex} onSelect={handleSelect} />
                        </div>
                    )}
                </div>

                {hasData ? (
                    <LensList
                        lenses={lenses}
                        active={safeIndex}
                        rotateMs={ROTATE_MS}
                        onSelect={handleSelect}
                    />
                ) : (
                    <LensListSkeleton />
                )}
            </div>
        </div>
    );
}