// components/home/InvestmentAreas.tsx
'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import {
    ArrowRight,
    ChevronRight,
    Network,
    UtilityPole,
    ShieldCheck,
    Building2,
    Sprout,
    BusFront,
    Factory,
    Gauge,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useInvestmentAreas, type InvestmentArea } from '@/hooks/useInvestmentAreas';

interface AreaWithIcon extends InvestmentArea {
    Icon: LucideIcon;
}

const COLOR_CLASSES = [
    'bg-slate-700',
    'bg-slate-600',
    'bg-slate-500',
    'bg-slate-400',
    'bg-slate-600',
    'bg-slate-500',
    'bg-slate-400',
    'bg-slate-300',
];

// Grid slot configuration — how many real investment areas to display before
// falling back to a "More areas" tile / "View all" link. Tune these to
// change how many tiles show per breakpoint without touching layout logic.
const DESKTOP_ROW_SIZE = 4;   // tiles per desktop row (3 rows × 4 = 12 real tiles)
const DESKTOP_TILE_COUNT = 12; // real area tiles shown when there's overflow (13th slot becomes the "More areas" tile)
const DESKTOP_FULL_COUNT = DESKTOP_TILE_COUNT + 1; // 13 — real area tiles shown when there's no overflow (fills the last row's final slot, no "more" tile)
const MOBILE_TILE_COUNT = 3;  // real area tiles shown on mobile before the "View All Investment Areas" link

function formatFunding(amount: number): string {
    if (!amount) return '$0';
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
}

function truncateName(name: string, maxLength = 40): string {
    if (!name || name.length <= maxLength) return name;
    return name.slice(0, maxLength).trimEnd() + '…';
}

function shortenAreaName(name: string): string {
    return name.replace(/\band\b/gi, '&');
}

const ICON_RULES: [RegExp, LucideIcon][] = [
    [/grid.*modern|modern.*grid/i, UtilityPole],
    [/grid|decentral/i, Network],
    [/resilien|safety/i, ShieldCheck],
    [/building/i, Building2],
    [/entrepreneur|ecosystem/i, Sprout],
    [/transport/i, BusFront],
    [/industrial|agricultur/i, Factory],
    [/reliab/i, Gauge],
];

function getAreaIcon(name: string): LucideIcon {
    return ICON_RULES.find(([re]) => re.test(name))?.[1] ?? Zap;
}

function AreaIcon({ icon: Icon }: { icon: LucideIcon }) {
    return (
        <Icon
            className="absolute -bottom-[14%] -right-[3%] h-[110%] w-auto text-white opacity-5 pointer-events-none"
            strokeWidth={1}
            aria-hidden="true"
        />
    );
}

function sumFunding(arr: { funding: number }[]): number {
    return arr.reduce((s, a) => s + a.funding, 0);
}

export function InvestmentAreas() {
    const { data, loading } = useInvestmentAreas();

    const areas = data?.areas ?? [];
    // NOTE: data.total is still not a reliable "true total" of investment
    // areas — it's derived as areas.length from the API's own query, so if
    // that query is ever limited again below the real count, `total` would
    // understate it the same way it did before. We don't use it for display;
    // `areas.length` (the raw fetched list, pre-slice) is what drives
    // `showMoreTile` below, since that only needs to know whether more rows
    // came back than we're showing — not the exact real-world total.

    const [selectedArea, setSelectedArea] = useState<InvestmentArea | null>(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [showBelow, setShowBelow] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleAreaClick = (
        area: InvestmentArea,
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (!containerRect) return;

        const top = rect.top - containerRect.top;
        const isMobile = window.innerWidth < 768;
        const left = isMobile
            ? containerRect.width / 2
            : rect.left - containerRect.left + rect.width / 2;

        setShowBelow(rect.top < 250);
        setPopupPosition({ top, left });
        setSelectedArea(area);
    };

    // Reserve the last grid slot for a "see more" tile whenever there are
    // more investment areas than DESKTOP_TILE_COUNT can show.
    const MORE_TILE_WIDTH_PCT = 22;
    const showMoreTile = areas.length > DESKTOP_TILE_COUNT;
    const realAreaCount = showMoreTile ? DESKTOP_TILE_COUNT : DESKTOP_FULL_COUNT;

    const topAreas = areas.slice(0, realAreaCount);

    const areasWithIcon: AreaWithIcon[] = topAreas.map(area => ({
        ...area,
        Icon: getAreaIcon(area.name),
    }));

    const hasFullDesktopLayout = areasWithIcon.length >= realAreaCount;

    const row1 = areasWithIcon.slice(0, DESKTOP_ROW_SIZE);
    const row2 = areasWithIcon.slice(DESKTOP_ROW_SIZE, DESKTOP_ROW_SIZE * 2);
    const row3 = areasWithIcon.slice(DESKTOP_ROW_SIZE * 2, realAreaCount);

    const rowTotals = {
        r1: sumFunding(row1),
        r2: sumFunding(row2),
        r3: sumFunding(row3),
    };

    const totalRows = rowTotals.r1 + rowTotals.r2 + rowTotals.r3;

    const rowHeights =
        totalRows > 0
            ? {
                r1: (rowTotals.r1 / totalRows) * 100,
                r2: (rowTotals.r2 / totalRows) * 100,
                r3: (rowTotals.r3 / totalRows) * 100,
            }
            : { r1: 33, r2: 33, r3: 34 };

    const row3AvailablePct = showMoreTile ? 100 - MORE_TILE_WIDTH_PCT : 100;

    const rowWidths = {
        r1: row1.map(a => (rowTotals.r1 > 0 ? (a.funding / rowTotals.r1) * 100 : 50)),
        r2: row2.map(a => (rowTotals.r2 > 0 ? (a.funding / rowTotals.r2) * 100 : 50)),
        r3: row3.map(a =>
            rowTotals.r3 > 0
                ? (a.funding / rowTotals.r3) * row3AvailablePct
                : row3AvailablePct / (row3.length || 1),
        ),
    };

    const mobileAreas = areasWithIcon.slice(0, MOBILE_TILE_COUNT);
    const mRowA = mobileAreas.slice(0, 2);
    const mRowB = mobileAreas.slice(2, 3);

    const mTotals = {
        a: sumFunding(mRowA),
        b: sumFunding(mRowB),
    };

    const mTotal = mTotals.a + mTotals.b;

    const mHeights =
        mTotal > 0
            ? {
                a: (mTotals.a / mTotal) * 100,
                b: (mTotals.b / mTotal) * 100,
            }
            : { a: 60, b: 40 };

    const mWidthsA = mRowA.map(a =>
        mTotals.a > 0 ? (a.funding / mTotals.a) * 100 : 50
    );

    if (loading) {
        return (
            <section className="py-2 bg-white relative">
                <div className="">
                    <div className="header ">
                        <div className="h-9 w-64 bg-slate-200 rounded animate-pulse mb-4" />
                        <div className="h-4 w-full max-w-2xl bg-slate-200 rounded animate-pulse" />
                    </div>

                    <div className="hidden md:block bg-slate-100 p-1.5 rounded-lg aspect-[16/5] animate-pulse" />
                    <div className="md:hidden bg-slate-100 p-1.5 rounded-lg aspect-[4/4] animate-pulse" />
                </div>
            </section>
        );
    }

    if (areasWithIcon.length === 0) {
        return null;
    }

    return (
        <section className="py-2 bg-white relative">
            <div className="">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="header "
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[0.95] tracking-tight text-slate-900 my-4">
                        Investment Areas
                    </h2>

                    <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-slate-500 pb-4">
                        Explore the investment areas that organize our portfolio. From grid modernization and resilient infrastructure to transportation, buildings, and industry. Each area brings together the projects and funding driving that work.                    </p>
                </motion.div>

                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-0 md:mb-8 relative"
                >
                    <AnimatePresence>
                        {selectedArea && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40"
                                onClick={() => setSelectedArea(null)}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {selectedArea && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute -translate-x-1/2 w-[calc(100%-2rem)] md:w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden ${
                                    showBelow ? 'translate-y-0 mt-2' : '-translate-y-full mb-4'
                                }`}
                                style={{
                                    top: `${popupPosition.top}px`,
                                    left: `${popupPosition.left}px`,
                                }}
                            >
                                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        {selectedArea.name}
                                    </h3>

                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Top {selectedArea.projects.length} of{' '}
                                        {selectedArea.projectCount.toLocaleString()} projects
                                    </p>

                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Some of these projects may also fall under other investment areas.
                                    </p>
                                </div>

                                <div className="p-3">
                                    {selectedArea.projects.length === 0 ? (
                                        <p className="text-xs text-slate-500 py-2">
                                            No project details available.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedArea.projects.map(project => (
                                                <Link
                                                    key={project.id}
                                                    href={`/projects/${project.id}`}
                                                    className="flex items-center justify-between gap-3 text-xs py-1.5 hover:bg-slate-50 rounded px-2 -mx-2"
                                                    onClick={() => setSelectedArea(null)}
                                                >
                                                    <span className="text-slate-700 truncate flex-1">
                                                        {truncateName(project.name, 35)}
                                                    </span>

                                                    <span className="font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                                                        {formatFunding(project.funding)}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1.5">
                                        <Link
                                            href={`/projects?investmentAreaId=${selectedArea.id}`}
                                            className="text-xs font-medium text-slate-900 hover:text-slate-700 inline-flex items-center gap-1 group"
                                            onClick={() => setSelectedArea(null)}
                                        >
                                            View all {selectedArea.name.toLowerCase()} projects
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>

                                        <Link
                                            href={`/projects?view=spending&investmentAreaId=${selectedArea.id}`}
                                            className="text-xs font-medium text-slate-600 hover:text-slate-800 inline-flex items-center gap-1 group"
                                            onClick={() => setSelectedArea(null)}
                                        >
                                            Compare in Spending Insights
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop treemap */}
                    {hasFullDesktopLayout && (
                        <div className="hidden md:block bg-slate-100 p-1.5 rounded-lg aspect-[16/7]">
                            <div className="flex flex-col h-full gap-1.5">
                                <div
                                    className="flex gap-1.5"
                                    style={{ height: `${rowHeights.r1}%` }}
                                >
                                    {row1.map((area, i) => (
                                        <motion.div
                                            key={area.id}
                                            onClick={e => handleAreaClick(area, e)}
                                            className={`${COLOR_CLASSES[i % COLOR_CLASSES.length]} relative overflow-hidden rounded p-3 flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer group`}
                                            style={{ width: `${rowWidths.r1[i]}%` }}
                                        >
                                            <AreaIcon icon={area.Icon} />

                                            <div className="text-white font-medium text-sm">
                                                {shortenAreaName(area.name)}
                                            </div>

                                            <div className="text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to view top projects
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div
                                    className="flex gap-1.5"
                                    style={{ height: `${rowHeights.r2}%` }}
                                >
                                    {row2.map((area, i) => (
                                        <motion.div
                                            key={area.id}
                                            onClick={e => handleAreaClick(area, e)}
                                            className={`${COLOR_CLASSES[(DESKTOP_ROW_SIZE + i) % COLOR_CLASSES.length]} relative overflow-hidden rounded p-3 flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer group`}
                                            style={{ width: `${rowWidths.r2[i]}%` }}
                                        >
                                            <AreaIcon icon={area.Icon} />

                                            <div className="text-white font-medium text-sm">
                                                {shortenAreaName(area.name)}
                                            </div>

                                            <div className="text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to view top projects
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div
                                    className="flex gap-1.5"
                                    style={{ height: `${rowHeights.r3}%` }}
                                >
                                    {row3.map((area, i) => (
                                        <motion.div
                                            key={area.id}
                                            onClick={e => handleAreaClick(area, e)}
                                            className={`${COLOR_CLASSES[(DESKTOP_ROW_SIZE * 2 + i) % COLOR_CLASSES.length]} relative overflow-hidden rounded p-2.5 flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer group`}
                                            style={{ width: `${rowWidths.r3[i]}%` }}
                                        >
                                            <AreaIcon icon={area.Icon} />

                                            <div className="text-white font-medium text-xs">
                                                {shortenAreaName(area.name)}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {showMoreTile && (
                                        <Link
                                            href="/projects?view=spending"
                                            className="relative overflow-hidden rounded border-2 border-dashed border-slate-300 bg-white p-2.5 flex flex-col items-center justify-center gap-1 text-center hover:border-slate-400 hover:bg-slate-50 transition-colors group"
                                            style={{ width: `${MORE_TILE_WIDTH_PCT}%` }}
                                        >
                                            <span className="text-slate-500 font-semibold text-xs">
                                                More areas
                                            </span>
                                            <span className="text-slate-400 text-[10px] inline-flex items-center gap-0.5">
                                                See all
                                                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile treemap */}
                    {mobileAreas.length >= 3 && (
                        <div className="md:hidden bg-slate-100 rounded-lg aspect-[4/4]">
                            <div className="flex flex-col h-full gap-1.5">
                                <div
                                    className="flex gap-1.5"
                                    style={{ height: `${mHeights.a}%` }}
                                >
                                    {mRowA.map((area, idx) => (
                                        <motion.div
                                            key={area.id}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.45,
                                                delay: 0.1 + idx * 0.05,
                                            }}
                                            onClick={e => handleAreaClick(area, e)}
                                            className={`${COLOR_CLASSES[idx]} relative overflow-hidden rounded p-3 flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer`}
                                            style={{ width: `${mWidthsA[idx]}%` }}
                                        >
                                            <AreaIcon icon={area.Icon} />

                                            <div className="text-white font-medium text-sm leading-tight">
                                                {shortenAreaName(area.name)}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div style={{ height: `${mHeights.b}%` }}>
                                    <motion.div
                                        key={mRowB[0].id}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.45, delay: 0.2 }}
                                        onClick={e => handleAreaClick(mRowB[0], e)}
                                        className={`${COLOR_CLASSES[2]} relative overflow-hidden rounded p-3 h-full flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer`}
                                    >
                                        <AreaIcon icon={mRowB[0].Icon} />

                                        <div className="text-white font-medium text-sm leading-tight">
                                            {shortenAreaName(mRowB[0].name)}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/projects?view=spending"
                        className="md:hidden flex w-full mt-2 bg-slate-300 p-4 flex-col justify-center items-center hover:opacity-90 transition-opacity rounded"
                    >
                        <span className="text-white font-medium text-sm text-center">
                            View All Investment Areas
                        </span>

                        <span className="text-white/80 text-xs mt-1">
                            See more categories
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}