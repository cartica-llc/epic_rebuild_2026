'use client';

import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
    createElement,
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from 'react';
import {
    ArrowRight,
    ArrowUpRight,
    ChevronRight,
    X,
    Network,
    UtilityPole,
    ShieldCheck,
    Building2,
    Sprout,
    BusFront,
    Factory,
    Gauge,
    Zap,
    Layers3,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
    useInvestmentAreas,
    type InvestmentArea,
} from '@/hooks/useInvestmentAreas';

interface AreaWithIcon extends InvestmentArea {
    Icon: LucideIcon;
}

interface TreemapRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface TreemapItem {
    area: AreaWithIcon;
    rect: TreemapRect;
    index: number;
}

interface LayoutNode {
    area: AreaWithIcon;
    value: number;
    index: number;
}

interface DetailPanelProps {
    area: InvestmentArea;
    onClose: () => void;
}

const DESKTOP_TILE_COUNT = 12;
const MOBILE_TILE_COUNT = 5;
const DESKTOP_MIN_HEIGHT = 510;

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

const TILE_COLORS = [
    {
        background: 'bg-slate-700',
        foreground: 'text-white',
        accent: 'text-slate-300',
    },
    {
        background: 'bg-slate-600',
        foreground: 'text-white',
        accent: 'text-slate-300',
    },
    {
        background: 'bg-slate-500',
        foreground: 'text-white',
        accent: 'text-slate-200',
    },
    {
        background: 'bg-slate-400',
        foreground: 'text-white',
        accent: 'text-white',
    },
    {
        background: 'bg-slate-600',
        foreground: 'text-white',
        accent: 'text-slate-300',
    },
    {
        background: 'bg-slate-500',
        foreground: 'text-white',
        accent: 'text-slate-200',
    },
    {
        background: 'bg-slate-400',
        foreground: 'text-white',
        accent: 'text-white',
    },
    {
        background: 'bg-slate-300',
        foreground: 'text-slate-800',
        accent: 'text-slate-600',
    },
];

function truncateName(name: string, maxLength = 40): string {
    if (!name || name.length <= maxLength) return name;

    return name.slice(0, maxLength).trimEnd() + '…';
}

function shortenAreaName(name: string): string {
    return name.replace(/\band\b/gi, '&');
}

function getAreaIcon(name: string): LucideIcon {
    return ICON_RULES.find(([regex]) => regex.test(name))?.[1] ?? Zap;
}

function getTileColor(index: number) {
    return TILE_COLORS[index % TILE_COLORS.length];
}

function getTileTypography(rect: TreemapRect) {
    const area = rect.width * rect.height;

    if (rect.width < 15 || rect.height < 19) {
        return {
            size: 'text-[11px] sm:text-xs',
            padding: 'p-3',
            showIcon: false,
            showArrow: false,
            compact: true,
        };
    }

    if (area < 450 || rect.width < 23) {
        return {
            size: 'text-xs lg:text-sm',
            padding: 'p-3 lg:p-4',
            showIcon: false,
            showArrow: true,
            compact: true,
        };
    }

    if (area < 1100) {
        return {
            size: 'text-sm lg:text-base',
            padding: 'p-4 lg:p-5',
            showIcon: true,
            showArrow: true,
            compact: false,
        };
    }

    return {
        size: 'text-base lg:text-xl xl:text-2xl',
        padding: 'p-5 lg:p-7',
        showIcon: true,
        showArrow: true,
        compact: false,
    };
}

function worstAspectRatio(
    row: LayoutNode[],
    sideLength: number
): number {
    if (!row.length || sideLength <= 0) {
        return Infinity;
    }

    const values = row.map(item => item.value);

    const sum = values.reduce((total, value) => total + value, 0);
    const max = Math.max(...values);
    const min = Math.min(...values);

    if (min <= 0 || sum <= 0) {
        return Infinity;
    }

    const sideSquared = sideLength * sideLength;
    const sumSquared = sum * sum;

    return Math.max(
        (sideSquared * max) / sumSquared,
        sumSquared / (sideSquared * min)
    );
}

function createTreemapLayout(
    areas: AreaWithIcon[],
    width = 100,
    height = 100
): TreemapItem[] {
    if (!areas.length) {
        return [];
    }

    const positiveFunding = areas
        .map(area => Number(area.funding) || 0)
        .filter(value => value > 0);

    const smallestFunding = positiveFunding.length
        ? Math.min(...positiveFunding)
        : 1;

    const fallbackFunding = Math.max(smallestFunding * 0.15, 1);

    const nodes: LayoutNode[] = areas.map((area, index) => ({
        area,
        index,
        value: Math.max(Number(area.funding) || 0, fallbackFunding),
    }));

    const totalFunding = nodes.reduce(
        (total, node) => total + node.value,
        0
    );

    const scale = (width * height) / totalFunding;

    const remaining = nodes
        .map(node => ({
            ...node,
            value: node.value * scale,
        }))
        .sort((a, b) => b.value - a.value);

    const results: TreemapItem[] = [];

    let x = 0;
    let y = 0;
    let remainingWidth = width;
    let remainingHeight = height;

    function layoutRow(row: LayoutNode[]) {
        if (!row.length) return;

        const rowArea = row.reduce(
            (total, node) => total + node.value,
            0
        );

        const horizontal = remainingWidth >= remainingHeight;

        if (horizontal) {
            const rowWidth =
                remainingHeight > 0
                    ? rowArea / remainingHeight
                    : 0;

            let currentY = y;

            row.forEach((node, index) => {
                const nodeHeight =
                    rowWidth > 0
                        ? node.value / rowWidth
                        : 0;

                const finalHeight =
                    index === row.length - 1
                        ? y + remainingHeight - currentY
                        : nodeHeight;

                results.push({
                    area: node.area,
                    index: node.index,
                    rect: {
                        x,
                        y: currentY,
                        width: rowWidth,
                        height: finalHeight,
                    },
                });

                currentY += finalHeight;
            });

            x += rowWidth;
            remainingWidth -= rowWidth;
        } else {
            const rowHeight =
                remainingWidth > 0
                    ? rowArea / remainingWidth
                    : 0;

            let currentX = x;

            row.forEach((node, index) => {
                const nodeWidth =
                    rowHeight > 0
                        ? node.value / rowHeight
                        : 0;

                const finalWidth =
                    index === row.length - 1
                        ? x + remainingWidth - currentX
                        : nodeWidth;

                results.push({
                    area: node.area,
                    index: node.index,
                    rect: {
                        x: currentX,
                        y,
                        width: finalWidth,
                        height: rowHeight,
                    },
                });

                currentX += finalWidth;
            });

            y += rowHeight;
            remainingHeight -= rowHeight;
        }
    }

    let row: LayoutNode[] = [];

    while (remaining.length > 0) {
        const next = remaining[0];

        if (!row.length) {
            row.push(next);
            remaining.shift();
            continue;
        }

        const sideLength = Math.min(
            remainingWidth,
            remainingHeight
        );

        const currentRatio = worstAspectRatio(
            row,
            sideLength
        );

        const nextRatio = worstAspectRatio(
            [...row, next],
            sideLength
        );

        if (nextRatio <= currentRatio) {
            row.push(next);
            remaining.shift();
        } else {
            layoutRow(row);
            row = [];
        }
    }

    if (row.length) {
        layoutRow(row);
    }

    return results;
}

interface InvestmentTileProps {
    item: TreemapItem;
    onSelect: (area: InvestmentArea) => void;
    isSelected: boolean;
    hasSelection: boolean;
    index: number;
}

function InvestmentTile({
                            item,
                            onSelect,
                            isSelected,
                            hasSelection,
                            index,
                        }: InvestmentTileProps) {
    const { area, rect } = item;

    const color = getTileColor(item.index);
    const typography = getTileTypography(rect);
    const shouldReduceMotion = useReducedMotion();

    const isLarge =
        rect.width * rect.height > 900 &&
        rect.width > 20 &&
        rect.height > 20;

    const isDarkText = color.foreground !== 'text-white';

    return (
        <motion.button
            type="button"
            layout
            initial={
                shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.97,
                    }
            }
            whileInView={{
                opacity: 1,
                scale: 1,
            }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: shouldReduceMotion
                    ? 0
                    : Math.min(index * 0.035, 0.3),
                ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => onSelect(area)}
            aria-label={`Explore ${area.name}`}
            aria-pressed={isSelected}
            className={`
                absolute
                group
                overflow-hidden
                rounded-[6px]
                text-left
                outline-none
                focus-visible:ring-2
                focus-visible:ring-slate-900
                focus-visible:ring-offset-2
                transition-opacity
                duration-300
                ${
                hasSelection && !isSelected
                    ? 'opacity-60'
                    : 'opacity-100'
            }
            `}
            style={{
                left: `${rect.x}%`,
                top: `${rect.y}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
                padding: '4px',
                zIndex: isSelected ? 10 : 1,
            }}
        >
            <div
                className={`
                    relative
                    flex
                    h-full
                    w-full
                    flex-col
                    justify-between
                    overflow-hidden
                    rounded-[5px]
                    ${typography.padding}
                    ${color.background}
                    ${color.foreground}
                    transition-[filter]
                    duration-300
                    group-hover:brightness-105
                    group-focus-visible:brightness-105
                    ${
                    isSelected
                        ? isDarkText
                            ? 'ring-2 ring-inset ring-slate-900/40'
                            : 'ring-2 ring-inset ring-white/70'
                        : ''
                }
                `}
            >
                {isLarge &&
                    createElement(area.Icon, {
                        'aria-hidden': true,
                        strokeWidth: 0.7,
                        className: `
                            pointer-events-none
                            absolute
                            -right-8
                            -bottom-10
                            h-[90%]
                            w-auto
                            max-w-none
                            transition-all
                            duration-700
                            ease-out
                            group-hover:-translate-x-3
                            group-hover:-translate-y-3
                            group-hover:rotate-[-8deg]
                            ${
                            isDarkText
                                ? 'text-slate-900/[0.10] group-hover:text-slate-900/[0.15]'
                                : 'text-white/[0.13] group-hover:text-white/[0.18]'
                        }
                        `,
                    })}

                <div className="relative z-10 flex items-start justify-between gap-2">
                    {typography.showIcon ? (
                        <div
                            className={`
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-md
                                border
                                backdrop-blur-sm
                                transition-colors
                                duration-300
                                ${
                                isDarkText
                                    ? 'border-slate-900/10 bg-slate-900/[0.07] group-hover:bg-slate-900/[0.11]'
                                    : 'border-white/20 bg-white/[0.10] group-hover:bg-white/[0.17]'
                            }
                            `}
                        >
                            {createElement(area.Icon, {
                                className: `h-[18px] w-[18px] ${color.accent}`,
                                strokeWidth: 1.5,
                            })}
                        </div>
                    ) : (
                        <div />
                    )}

                    {typography.showArrow && (
                        <ArrowUpRight
                            className={`
                                h-4
                                w-4
                                shrink-0
                                transition-all
                                duration-300
                                group-hover:translate-x-0.5
                                group-hover:-translate-y-0.5
                                ${
                                isDarkText
                                    ? 'text-slate-700/60 group-hover:text-slate-900'
                                    : 'text-white/60 group-hover:text-white'
                            }
                            `}
                            strokeWidth={1.5}
                        />
                    )}
                </div>

                <div className="relative z-10 min-w-0">
                    <h3
                        className={`
                            ${typography.size}
                            ${color.foreground}
                            font-medium
                            leading-[1.15]
                            tracking-[-0.025em]
                            break-words
                            [overflow-wrap:anywhere]
                        `}
                    >
                        {shortenAreaName(area.name)}
                    </h3>

                    {!typography.compact && (
                        <div
                            className={`
                                mt-3
                                flex
                                items-center
                                gap-1.5
                                text-[11px]
                                font-medium
                                opacity-0
                                translate-y-1
                                transition-all
                                duration-300
                                group-hover:opacity-100
                                group-hover:translate-y-0
                                ${
                                isDarkText
                                    ? 'text-slate-700'
                                    : 'text-white/80'
                            }
                            `}
                        >
                            Explore projects

                            <ArrowRight
                                className="h-3 w-3"
                                strokeWidth={1.5}
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.button>
    );
}

function InvestmentDetailPanel({
                                   area,
                                   onClose,
                               }: DetailPanelProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        closeButtonRef.current?.focus();
    }, []);

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="investment-detail-title"
            initial={{
                opacity: 0,
                x: 24,
            }}
            animate={{
                opacity: 1,
                x: 0,
            }}
            exit={{
                opacity: 0,
                x: 24,
            }}
            transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="
                fixed
                inset-y-0
                right-0
                z-[60]
                flex
                w-full
                max-w-[460px]
                flex-col
                overflow-hidden
                border-l
                border-slate-200
                bg-white
                shadow-2xl
            "
        >
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <span
                        className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-slate-400
                        "
                    >
                        Investment Area
                    </span>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close investment details"
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-slate-200
                            text-slate-500
                            transition-colors
                            hover:border-slate-300
                            hover:bg-slate-50
                            hover:text-slate-900
                            focus-visible:outline
                            focus-visible:outline-2
                            focus-visible:outline-offset-2
                            focus-visible:outline-slate-500
                        "
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div
                    className="
                        mb-5
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-700
                        text-white
                    "
                >
                    {createElement(getAreaIcon(area.name), {
                        className: 'h-6 w-6',
                        strokeWidth: 1.4,
                    })}
                </div>

                <h3
                    id="investment-detail-title"
                    className="
                        max-w-sm
                        text-3xl
                        font-semibold
                        leading-tight
                        tracking-tight
                        text-slate-900
                    "
                >
                    {area.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Explore projects associated with this investment area.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                <div className="mb-5 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">
                        Featured Projects
                    </h4>

                    <Layers3
                        className="h-4 w-4 text-slate-400"
                        strokeWidth={1.5}
                    />
                </div>

                {area.projects.length === 0 ? (
                    <div
                        className="
                            rounded-xl
                            border
                            border-dashed
                            border-slate-200
                            px-5
                            py-10
                            text-center
                        "
                    >
                        <p className="text-sm text-slate-500">
                            No project details available.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {area.projects.map((project, index) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                onClick={onClose}
                                className="
                                    group
                                    flex
                                    items-start
                                    justify-between
                                    gap-4
                                    py-4
                                    transition-colors
                                    hover:text-slate-900
                                "
                            >
                                <div className="flex min-w-0 gap-4">
                                    <span
                                        className="
                                            pt-0.5
                                            text-[11px]
                                            font-medium
                                            tabular-nums
                                            text-slate-400
                                        "
                                    >
                                        {String(index + 1).padStart(2, '0')}
                                    </span>

                                    <span
                                        className="
                                            text-sm
                                            font-medium
                                            leading-relaxed
                                            text-slate-700
                                            transition-colors
                                            group-hover:text-slate-900
                                        "
                                    >
                                        {truncateName(project.name, 75)}
                                    </span>
                                </div>

                                <ArrowUpRight
                                    className="
                                        mt-0.5
                                        h-4
                                        w-4
                                        shrink-0
                                        text-slate-300
                                        transition-all
                                        group-hover:-translate-y-0.5
                                        group-hover:translate-x-0.5
                                        group-hover:text-slate-700
                                    "
                                />
                            </Link>
                        ))}
                    </div>
                )}

                <p className="mt-6 text-xs leading-relaxed text-slate-400">
                    Some projects may be associated with multiple
                    investment areas.
                </p>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/70 p-6 sm:px-8">
                <Link
                    href={`/projects?investmentAreaId=${area.id}`}
                    onClick={onClose}
                    className="
                        group
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-lg
                        bg-slate-700
                        px-5
                        py-4
                        text-sm
                        font-medium
                        text-white
                        transition-colors
                        hover:bg-slate-800
                    "
                >
                    View All Projects

                    <ArrowUpRight
                        className="
                            h-4
                            w-4
                            transition-transform
                            group-hover:translate-x-0.5
                            group-hover:-translate-y-0.5
                        "
                    />
                </Link>

                <Link
                    href={`/projects?view=spending&investmentAreaId=${area.id}`}
                    onClick={onClose}
                    className="
                        group
                        mt-4
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-xs
                        font-medium
                        text-slate-500
                        transition-colors
                        hover:text-slate-900
                    "
                >
                    Compare in Spending Insights

                    <ArrowRight
                        className="
                            h-3.5
                            w-3.5
                            transition-transform
                            group-hover:translate-x-0.5
                        "
                    />
                </Link>
            </div>
        </motion.div>
    );
}

interface MobileInvestmentCardProps {
    area: AreaWithIcon;
    index: number;
    onSelect: (area: InvestmentArea) => void;
}

function MobileInvestmentCard({
                                  area,
                                  index,
                                  onSelect,
                              }: MobileInvestmentCardProps) {
    const color = getTileColor(index);
    const isDarkText = color.foreground !== 'text-white';

    return (
        <motion.button
            type="button"
            initial={{
                opacity: 0,
                y: 16,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
            }}
            onClick={() => onSelect(area)}
            aria-label={`Explore ${area.name}`}
            className={`
                group
                relative
                flex
                min-h-[150px]
                w-full
                flex-col
                justify-between
                overflow-hidden
                rounded-lg
                p-5
                text-left
                ${color.background}
                ${color.foreground}
                transition-transform
                duration-300
                active:scale-[0.99]
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-slate-500
            `}
        >
            {createElement(area.Icon, {
                'aria-hidden': true,
                className: `
                    pointer-events-none
                    absolute
                    -bottom-6
                    -right-6
                    h-36
                    w-36
                    ${
                    isDarkText
                        ? 'text-slate-900/[0.10]'
                        : 'text-white/[0.13]'
                }
                `,
                strokeWidth: 0.8,
            })}

            <div className="relative z-10 flex items-start justify-between">
                {createElement(area.Icon, {
                    className: `h-5 w-5 ${color.accent}`,
                    strokeWidth: 1.5,
                })}

                <ArrowUpRight
                    className={`h-4 w-4 ${
                        isDarkText
                            ? 'text-slate-700/60'
                            : 'text-white/70'
                    }`}
                    strokeWidth={1.5}
                />
            </div>

            <div className="relative z-10">
                <h3
                    className={`
                        max-w-[85%]
                        text-lg
                        font-medium
                        leading-tight
                        tracking-tight
                        ${color.foreground}
                    `}
                >
                    {shortenAreaName(area.name)}
                </h3>
            </div>
        </motion.button>
    );
}

export function InvestmentAreas() {
    const { data, loading } = useInvestmentAreas();

    const [selectedArea, setSelectedArea] =
        useState<InvestmentArea | null>(null);

    const triggerRef = useRef<HTMLElement | null>(null);

    const areas = useMemo(
        () => data?.areas ?? [],
        [data?.areas]
    );

    const areasWithIcon = useMemo<AreaWithIcon[]>(
        () =>
            areas.map(area => ({
                ...area,
                Icon: getAreaIcon(area.name),
            })),
        [areas]
    );

    const desktopAreas = useMemo(
        () => areasWithIcon.slice(0, DESKTOP_TILE_COUNT),
        [areasWithIcon]
    );

    const mobileAreas = useMemo(
        () => areasWithIcon.slice(0, MOBILE_TILE_COUNT),
        [areasWithIcon]
    );

    const desktopLayout = useMemo(
        () => createTreemapLayout(desktopAreas),
        [desktopAreas]
    );

    const hasMoreAreas = areasWithIcon.length > DESKTOP_TILE_COUNT;

    const handleSelect = useCallback((area: InvestmentArea) => {
        triggerRef.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        setSelectedArea(area);
    }, []);

    const handleClose = useCallback(() => {
        setSelectedArea(null);

        requestAnimationFrame(() => {
            triggerRef.current?.focus();
        });
    }, []);

    useEffect(() => {
        if (!selectedArea) return;

        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedArea, handleClose]);

    useEffect(() => {
        if (!selectedArea) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [selectedArea]);

    if (loading) {
        return (
            <section className="relative bg-white py-8">
                <div className="mb-8">
                    <div className="mb-4 h-10 w-72 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
                </div>

                <div
                    className="
                        hidden
                        min-h-[510px]
                        animate-pulse
                        rounded-lg
                        bg-slate-100
                        md:block
                    "
                />

                <div className="space-y-3 md:hidden">
                    {[1, 2, 3].map(item => (
                        <div
                            key={item}
                            className="
                                h-[150px]
                                animate-pulse
                                rounded-lg
                                bg-slate-100
                            "
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (!areasWithIcon.length) {
        return null;
    }

    return (
        <section className="relative overflow-hidden bg-white py-8 md:py-12">
            <motion.div
                initial={{
                    opacity: 0,
                    y: 16,
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="mb-8 md:mb-10"
            >
                <div className="mb-5 flex items-center gap-3">
                    <span className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-sm">
                        Explore the Portfolio
                    </span>
                </div>

                <div
                    className="
                        flex
                        flex-col
                        gap-6
                        lg:flex-row
                        lg:items-end
                        lg:justify-between
                    "
                >
                    <div>
                        <h2
                            className="
                                text-4xl
                                font-semibold
                                leading-[0.98]
                                tracking-[-0.045em]
                                text-slate-900
                                sm:text-5xl
                                md:text-6xl
                            "
                        >
                            Investment Areas
                        </h2>

                        <p
                            className="
                                mt-5
                                max-w-2xl
                                text-base
                                font-light
                                leading-relaxed
                                text-slate-500
                                md:text-lg
                            "
                        >
                            Explore the investment areas shaping our
                            portfolio, from grid modernization and resilient
                            infrastructure to transportation, buildings,
                            and industry.
                        </p>
                    </div>

                    <Link
                        href="/projects?view=spending"
                        className="
                            group
                            hidden
                            shrink-0
                            items-center
                            gap-3
                            pb-1
                            text-sm
                            font-medium
                            text-slate-700
                            transition-colors
                            hover:text-slate-950
                            md:inline-flex
                        "
                    >
                        Explore all areas

                        <span
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-slate-200
                                transition-all
                                duration-300
                                group-hover:border-slate-900
                                group-hover:bg-slate-900
                                group-hover:text-white
                            "
                        >
                            <ArrowUpRight
                                className="h-4 w-4"
                                strokeWidth={1.5}
                            />
                        </span>
                    </Link>
                </div>
            </motion.div>

            <div className="hidden md:block">
                <div
                    className="
                        relative
                        w-full
                        overflow-hidden
                        rounded-lg
                        bg-white
                    "
                    style={{
                        height: DESKTOP_MIN_HEIGHT,
                    }}
                >
                    {desktopLayout.map((item, index) => (
                        <InvestmentTile
                            key={item.area.id}
                            item={item}
                            index={index}
                            onSelect={handleSelect}
                            isSelected={
                                selectedArea?.id === item.area.id
                            }
                            hasSelection={selectedArea !== null}
                        />
                    ))}
                </div>

                <div
                    className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-t
                        border-slate-100
                        pt-4
                    "
                >
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-sm bg-slate-700" />
                            <span className="h-2 w-2 rounded-sm bg-slate-500" />
                            <span className="h-2 w-2 rounded-sm bg-slate-300" />
                        </div>

                        <span className="text-xs text-slate-400">
                            Tile size represents relative investment funding
                        </span>
                    </div>

                    <span className="text-xs text-slate-400">
                        Select an area to explore projects
                    </span>
                </div>

                {hasMoreAreas && (
                    <div className="mt-3 text-right">
                        <Link
                            href="/projects?view=spending"
                            className="
                                inline-flex
                                items-center
                                gap-1
                                text-xs
                                font-medium
                                text-slate-600
                                transition-colors
                                hover:text-slate-900
                            "
                        >
                            View additional investment areas

                            <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                )}
            </div>

            <div className="space-y-2.5 md:hidden">
                {mobileAreas.map((area, index) => (
                    <MobileInvestmentCard
                        key={area.id}
                        area={area}
                        index={index}
                        onSelect={handleSelect}
                    />
                ))}

                <Link
                    href="/projects?view=spending"
                    className="
                        group
                        flex
                        min-h-[74px]
                        w-full
                        items-center
                        justify-between
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50
                        px-5
                        transition-colors
                        hover:border-slate-300
                        hover:bg-slate-100
                    "
                >
                    <div>
                        <span
                            className="
                                block
                                text-sm
                                font-semibold
                                text-slate-900
                            "
                        >
                            View All Investment Areas
                        </span>

                        <span className="mt-1 block text-xs text-slate-500">
                            Explore the full portfolio
                        </span>
                    </div>

                    <ArrowUpRight
                        className="
                            h-5
                            w-5
                            text-slate-500
                            transition-transform
                            group-hover:translate-x-0.5
                            group-hover:-translate-y-0.5
                        "
                        strokeWidth={1.5}
                    />
                </Link>
            </div>

            <AnimatePresence>
                {selectedArea && (
                    <>
                        <motion.div
                            key="investment-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="
                                fixed
                                inset-0
                                z-[55]
                                bg-slate-950/35
                                backdrop-blur-[2px]
                            "
                            onClick={handleClose}
                            aria-hidden="true"
                        />

                        <InvestmentDetailPanel
                            key={selectedArea.id}
                            area={selectedArea}
                            onClose={handleClose}
                        />
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}