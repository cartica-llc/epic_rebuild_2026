'use client';

import {
    LayoutList,
    Sparkles,
    DollarSign,
    TrendingUp,
    Search,
    Map,
    ChevronDown,
    Check,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const INSIGHT_OPTIONS = [
    {
        id: 'spending',
        label: 'Spending Analysis',
        shortLabel: 'Spending',
        icon: DollarSign,
    },
    {
        id: 'market',
        label: 'Market Maturity',
        shortLabel: 'Market',
        icon: TrendingUp,
    },
    {
        id: 'technology',
        label: 'Key Learnings',
        shortLabel: 'Learnings',
        icon: Search,
    },
    {
        id: 'map',
        label: 'Project Map',
        shortLabel: 'Map',
        icon: Map,
    },
] as const;

const INSIGHT_IDS = INSIGHT_OPTIONS.map((o) => o.id) as readonly string[];

interface ProjectsMobileToggleProps {
    activePrefilter: string;
    onPrefilterChange: (next: string) => void;
}

const selectedLineClass =
    'absolute bottom-0 left-4 right-4 h-[3px] rounded-full bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600';

export function ProjectsMobileToggle({
                                         activePrefilter,
                                         onPrefilterChange,
                                     }: ProjectsMobileToggleProps) {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const insightButtonRef = useRef<HTMLButtonElement>(null);

    const isProjects = activePrefilter === 'all-projects';
    const isInsight = INSIGHT_IDS.includes(activePrefilter);

    const activeInsight =
        INSIGHT_OPTIONS.find((o) => o.id === activePrefilter) ?? INSIGHT_OPTIONS[0];

    const ActiveInsightIcon = activeInsight.icon;

    const updateMenuPosition = () => {
        const button = insightButtonRef.current;

        if (!button) return;

        const rect = button.getBoundingClientRect();

        setMenuStyle({
            top: rect.bottom + 8,
            left: 16,
            right: 16,
        });
    };

    useEffect(() => {
        if (!open) return;

        updateMenuPosition();

        window.addEventListener('resize', updateMenuPosition);
        window.addEventListener('scroll', updateMenuPosition, true);

        return () => {
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition, true);
        };
    }, [open]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectProjects = () => {
        setOpen(false);
        onPrefilterChange('all-projects');
    };

    const handleSelectInsight = (id: string) => {
        setOpen(false);
        onPrefilterChange(id);
    };

    const handleInsightButton = () => {
        if (!isInsight) {
            onPrefilterChange('spending');
            setOpen(true);
            return;
        }

        setOpen((current) => !current);
    };

    return (
        <div
            ref={containerRef}
            className="relative block border-t border-slate-200 lg:hidden"
        >
            <div
                role="tablist"
                aria-label="Project view mode"
                className="grid grid-cols-2"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={isProjects}
                    onClick={handleSelectProjects}
                    className={`relative flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition ${
                        isProjects
                            ? 'text-slate-950'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <LayoutList className="h-4 w-4" />
                    Projects

                    {isProjects && (
                        <motion.span
                            layoutId="mobile-header-toggle-line"
                            className={selectedLineClass}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        />
                    )}
                </button>

                <button
                    ref={insightButtonRef}
                    type="button"
                    role="tab"
                    aria-selected={isInsight}
                    aria-expanded={open}
                    onClick={handleInsightButton}
                    className={`relative flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition ${
                        isInsight
                            ? 'text-slate-950'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {isInsight ? (
                        <ActiveInsightIcon className="h-4 w-4" />
                    ) : (
                        <Sparkles className="h-4 w-4" />
                    )}

                    <span className="truncate">
                        {isInsight ? activeInsight.shortLabel : 'Insights'}
                    </span>

                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                            open ? 'rotate-180' : ''
                        }`}
                    />

                    {isInsight && (
                        <motion.span
                            layoutId="mobile-header-toggle-line"
                            className={selectedLineClass}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        />
                    )}
                </button>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                        style={menuStyle}
                        className="fixed z-[999] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                    >
                        {INSIGHT_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isActive = activePrefilter === option.id;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelectInsight(option.id)}
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                                        isActive
                                            ? 'bg-slate-50 text-slate-950'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />

                                    <span className="min-w-0 flex-1 truncate font-medium">
                                        {option.label}
                                    </span>

                                    {isActive && (
                                        <Check className="h-4 w-4 shrink-0 text-slate-900" />
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}