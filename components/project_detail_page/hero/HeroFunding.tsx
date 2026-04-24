// components/project-detail/HeroFunding.tsx
'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type Props = {
    committed: number;
    contracted: number;
    expended: number;
    encumbered: number;
    matchFunding: number;
    leveraged: number;
    maturityStage: string | null;
};

type PrimaryKey = 'committed' | 'contracted' | 'expended';

// ---------- constants ----------

const COLORS = {
    committed: '#d6d3d1',
    contracted: '#a8a29e',
    expended: 'rgb(42,60,35)',
    committedActive: '#f5f5f4',
    contractedActive: '#e7e5e4',
    expendedActive: '#305101',
    matchFunding: '#78716c',
    leveraged: '#44403c',
    emptyTrack: 'rgba(255,255,255,0.12)',
    emptyTrackBorder: 'rgba(255,255,255,0.18)',
    bubbleBg: 'rgba(28, 25, 23, 0.96)',
    bubbleBorder: 'rgba(255,255,255,0.12)',
    activeRing: 'rgba(255,255,255,0.55)',
} as const;


const fmtSFloor = (value: number) => {
    if (value <= 0) return '—';
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (abs >= 1_000_000_000) return `${sign}$${(Math.floor(abs / 100_000_000) / 10).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${sign}$${(Math.floor(abs / 100_000) / 10).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}$${Math.floor(abs / 1_000)}K`;
    return `${sign}$${Math.floor(abs)}`;
};

const fmtFull = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(Math.floor(value));

// ---------- tooltip ----------

function Tooltip({
                     show,
                     text,
                     align = 'left',
                 }: {
    show: boolean;
    text: string;
    align?: 'left' | 'center';
}) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className={[
                        'pointer-events-none absolute z-30 -top-8',
                        align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
                    ].join(' ')}
                >
                    <div
                        className="whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-medium tabular-nums text-white shadow-md backdrop-blur-sm"
                        style={{
                            backgroundColor: COLORS.bubbleBg,
                            borderColor: COLORS.bubbleBorder,
                        }}
                    >
                        {text}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ---------- primary KPI (linked to progress bar + legend) ----------

function PrimaryKpi({
                        k,
                        label,
                        amount,
                        activeKey,
                        onHover,
                        onToggle,
                    }: {
    k: PrimaryKey;
    label: string;
    amount: number;
    activeKey: PrimaryKey | null;
    onHover: (key: PrimaryKey | null) => void;
    onToggle: (key: PrimaryKey) => void;
}) {
    const hasValue = amount > 0;
    const isActive = activeKey === k;
    const someoneElseActive = activeKey !== null && !isActive;

    return (
        <div className="relative">
            <p
                className={[
                    'text-[10px] font-bold uppercase tracking-[0.18em] transition-colors',
                    isActive ? 'text-white/70' : hasValue ? 'text-white/35' : 'text-white/20',
                ].join(' ')}
            >
                {label}
            </p>

            <div className="relative mt-1 inline-flex">
                <Tooltip show={isActive && hasValue} text={fmtFull(amount)} />

                <button
                    type="button"
                    onMouseEnter={() => hasValue && onHover(k)}
                    onMouseLeave={() => hasValue && onHover(null)}
                    onClick={() => hasValue && onToggle(k)}
                    disabled={!hasValue}
                    aria-pressed={isActive}
                    className={[
                        'text-left font-mono text-2xl font-bold tabular-nums transition-opacity duration-200 ease-out sm:text-3xl',
                        hasValue ? 'text-white' : 'text-white/35',
                        hasValue ? 'cursor-pointer' : 'cursor-default',
                        someoneElseActive ? 'opacity-50' : 'opacity-100',
                    ].join(' ')}
                >
                    {hasValue ? fmtSFloor(amount) : '—'}
                </button>
            </div>
        </div>
    );
}

// ---------- secondary KPI (standalone hover/pin, no graph link) ----------

function SecondaryKpi({ label, amount }: { label: string; amount: number }) {
    const [hovered, setHovered] = useState(false);
    const [pinned, setPinned] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const hasValue = amount > 0;
    const show = hasValue && (hovered || pinned);

    useEffect(() => {
        if (!pinned) return;
        const onDown = (e: MouseEvent | TouchEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setPinned(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPinned(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('touchstart', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('touchstart', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [pinned]);

    return (
        <div ref={wrapRef} className="relative">
            <p
                className={[
                    'text-[10px] font-bold uppercase tracking-[0.18em]',
                    hasValue ? 'text-white/30' : 'text-white/20',
                ].join(' ')}
            >
                {label}
            </p>

            <div className="relative mt-0.5 inline-flex">
                <Tooltip show={show} text={fmtFull(amount)} />

                <button
                    type="button"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={() => hasValue && setPinned((p) => !p)}
                    disabled={!hasValue}
                    aria-pressed={pinned}
                    className={[
                        'text-sm font-semibold tabular-nums transition-opacity',
                        hasValue ? 'text-white/75 hover:opacity-85' : 'text-white/30',
                        hasValue ? 'cursor-pointer' : 'cursor-default',
                    ].join(' ')}
                >
                    {hasValue ? fmtSFloor(amount) : '—'}
                </button>
            </div>
        </div>
    );
}

// ---------- progress bar ----------

type Segment = { key: PrimaryKey; label: string; amount: number; color: string; activeColor: string };

function ProgressBar({
                         segments,
                         max,
                         activeKey,
                         onHover,
                         onToggle,
                     }: {
    segments: Segment[];
    max: number;
    activeKey: PrimaryKey | null;
    onHover: (key: PrimaryKey | null) => void;
    onToggle: (key: PrimaryKey) => void;
}) {
    const hasAny = segments.some((s) => s.amount > 0);

    return (
        <div
            className={[
                'relative h-7 w-full overflow-visible rounded-sm',
                !hasAny ? 'ring-1 ring-inset' : '',
            ].join(' ')}
            style={{
                backgroundColor: hasAny ? 'rgba(255,255,255,0.08)' : COLORS.emptyTrack,
                boxShadow: !hasAny ? `inset 0 0 0 1px ${COLORS.emptyTrackBorder}` : undefined,
            }}
            aria-label={
                hasAny
                    ? 'Funding progress bar showing committed, contracted, and expended values'
                    : 'No primary funding data available'
            }
        >
            {!hasAny && (
                <div
                    className="absolute inset-0 rounded-sm"
                    style={{
                        background:
                            'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 16px)',
                    }}
                />
            )}

            {segments.map((seg) => {
                if (seg.amount <= 0) return null;
                const width = Math.min((seg.amount / max) * 100, 100);
                const isActive = activeKey === seg.key;
                const someoneElseActive = activeKey !== null && !isActive;

                return (
                    <button
                        type="button"
                        key={seg.key}
                        onMouseEnter={() => onHover(seg.key)}
                        onMouseLeave={() => onHover(null)}
                        onClick={() => onToggle(seg.key)}
                        aria-pressed={isActive}
                        aria-label={`${seg.label}: ${fmtFull(seg.amount)}`}
                        className="group absolute inset-y-0 left-0 cursor-pointer overflow-hidden"
                        style={{
                            width: `${width}%`,
                            backgroundColor: seg.color,
                        }}
                    >
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out"
                            style={{
                                backgroundColor: seg.activeColor,
                                opacity: isActive ? 1 : 0,
                            }}
                        />
                        {/* Dim overlay — fades in when another segment is active */}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out"
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.35)',
                                opacity: someoneElseActive ? 1 : 0,
                            }}
                        />
                        {/* Active ring — fades in, never jumps */}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out"
                            style={{
                                boxShadow: `inset 0 0 0 1.5px ${COLORS.activeRing}`,
                                opacity: isActive ? 1 : 0,
                            }}
                        />

                        <Tooltip
                            show={isActive}
                            text={`${seg.label}: ${fmtFull(seg.amount)}`}
                            align="center"
                        />
                    </button>
                );
            })}
        </div>
    );
}

// ---------- legend ----------

function Legend({
                    segments,
                    activeKey,
                    onHover,
                    onToggle,
                    hasAny,
                }: {
    segments: Segment[];
    activeKey: PrimaryKey | null;
    onHover: (key: PrimaryKey | null) => void;
    onToggle: (key: PrimaryKey) => void;
    hasAny: boolean;
}) {
    return (
        <div className="mt-2 flex flex-wrap items-center gap-6 text-xs">
            {segments.map((seg) => {
                const hasValue = seg.amount > 0;
                const isActive = activeKey === seg.key;
                const someoneElseActive = activeKey !== null && !isActive;

                return (
                    <button
                        type="button"
                        key={seg.key}
                        onMouseEnter={() => hasValue && onHover(seg.key)}
                        onMouseLeave={() => hasValue && onHover(null)}
                        onClick={() => hasValue && onToggle(seg.key)}
                        disabled={!hasValue}
                        aria-pressed={isActive}
                        className={[
                            'flex items-center gap-2 transition-colors duration-200 ease-out',
                            hasValue ? 'cursor-pointer' : 'cursor-default',
                            isActive
                                ? 'text-white'
                                : hasValue
                                    ? someoneElseActive
                                        ? 'text-white/45'
                                        : 'text-white/75 hover:text-white'
                                    : 'text-white/25',
                        ].join(' ')}
                    >
                        <span
                            className="relative inline-block h-2 w-4 overflow-hidden rounded-sm"
                            style={{
                                backgroundColor: hasValue ? seg.color : 'rgba(255,255,255,0.15)',
                            }}
                        >
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out"
                                style={{
                                    backgroundColor: seg.activeColor,
                                    opacity: isActive ? 1 : 0,
                                }}
                            />
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out"
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.35)',
                                    opacity: someoneElseActive ? 1 : 0,
                                }}
                            />
                        </span>
                        {seg.label}
                    </button>
                );
            })}

            {!hasAny && (
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">
                    No primary funding data
                </span>
            )}
        </div>
    );
}

// ---------- maturity pill ----------

function MaturityStat({ stage }: { stage: string | null }) {
    const hasValue = !!stage;
    return (
        <div className="relative">
            <p
                className={[
                    'text-[10px] font-bold uppercase tracking-[0.18em]',
                    hasValue ? 'text-white/35' : 'text-white/20',
                ].join(' ')}
            >
                Maturity
            </p>
            <p
                className={[
                    'mt-1 text-lg font-bold sm:text-xl',
                    hasValue ? 'text-white' : 'text-white/35',
                ].join(' ')}
            >
                {stage ?? '—'}
            </p>
        </div>
    );
}

// ---------- main ----------

export function HeroFunding({
                                committed,
                                contracted,
                                expended,
                                encumbered,
                                matchFunding,
                                leveraged,
                                maturityStage,
                            }: Props) {
    const segments: Segment[] = [
        { key: 'committed', label: 'Committed', amount: committed, color: COLORS.committed, activeColor: COLORS.committedActive },
        { key: 'contracted', label: 'Contracted', amount: contracted, color: COLORS.contracted, activeColor: COLORS.contractedActive },
        { key: 'expended', label: 'Expended', amount: expended, color: COLORS.expended, activeColor: COLORS.expendedActive },
    ];

    const hasPrimary = segments.some((s) => s.amount > 0);
    const hasSecondary = encumbered > 0 || matchFunding > 0 || leveraged > 0;
    const hasAny = hasPrimary || hasSecondary;
    const max = Math.max(committed, contracted, expended, 1);

    // Shared active state for KPI ↔ segment ↔ legend highlighting.
    // `hovered` is transient mouse state; `pinned` is the clicked/sticky state
    // used on mobile and for keeping a value visible. The effective active key
    // is pinned-if-set, otherwise hovered.
    const [hoveredKey, setHoveredKey] = useState<PrimaryKey | null>(null);
    const [pinnedKey, setPinnedKey] = useState<PrimaryKey | null>(null);
    const activeKey: PrimaryKey | null = pinnedKey ?? hoveredKey;

    // Defer hover-clearing by one frame. When the mouse slides from one
    // segment to another, leave-on-A and enter-on-B fire in quick succession;
    // without this, the active state flashes to null between them and the
    // transition looks glitchy.
    const clearFrameRef = useRef<number | null>(null);
    const handleHover = (key: PrimaryKey | null) => {
        if (clearFrameRef.current !== null) {
            cancelAnimationFrame(clearFrameRef.current);
            clearFrameRef.current = null;
        }
        if (key === null) {
            clearFrameRef.current = requestAnimationFrame(() => {
                setHoveredKey(null);
                clearFrameRef.current = null;
            });
        } else {
            setHoveredKey(key);
        }
    };

    useEffect(() => {
        return () => {
            if (clearFrameRef.current !== null) cancelAnimationFrame(clearFrameRef.current);
        };
    }, []);

    const rootRef = useRef<HTMLDivElement | null>(null);

    // Dismiss pinned selection on outside click / touch / Escape.
    useEffect(() => {
        if (!pinnedKey) return;
        const onDown = (e: MouseEvent | TouchEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setPinnedKey(null);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPinnedKey(null);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('touchstart', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('touchstart', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [pinnedKey]);

    const handleToggle = (key: PrimaryKey) =>
        setPinnedKey((prev) => (prev === key ? null : key));

    return (
        <div ref={rootRef} className="mt-10 border-t border-white/10 pt-8">
            {/* Primary KPIs */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                {segments.map((seg) => (
                    <PrimaryKpi
                        key={seg.key}
                        k={seg.key}
                        label={seg.label}
                        amount={seg.amount}
                        activeKey={activeKey}
                        onHover={handleHover}
                        onToggle={handleToggle}
                    />
                ))}
                <MaturityStat stage={maturityStage} />
            </div>

            {/* Progress bar */}
            <div className="mt-7">
                <ProgressBar
                    segments={segments}
                    max={max}
                    activeKey={activeKey}
                    onHover={handleHover}
                    onToggle={handleToggle}
                />
                <Legend
                    segments={segments}
                    activeKey={activeKey}
                    onHover={handleHover}
                    onToggle={handleToggle}
                    hasAny={hasPrimary}
                />
            </div>

            {/* Secondary funding (independent, not graph-linked) */}
            <div className="mt-6 flex flex-wrap gap-8 border-t border-white/8 pt-5">
                <SecondaryKpi label="Encumbered" amount={encumbered} />
                <SecondaryKpi label="Match Funding" amount={matchFunding} />
                <SecondaryKpi label="Leveraged" amount={leveraged} />

                {!hasAny && (
                    <div className="min-w-[180px]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">
                            Status
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-white/35">
                            No funding data available yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}