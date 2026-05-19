// ─── components/projects_page/ProjectsMobileToggle.tsx ─────────────────

'use client';

import { LayoutList, Sparkles, DollarSign, TrendingUp, Search, Map } from 'lucide-react';
import { motion } from 'motion/react';

const INSIGHT_OPTIONS = [
    { id: 'spending',   label: 'Spending',   icon: DollarSign },
    { id: 'market',     label: 'Market',     icon: TrendingUp },
    { id: 'technology', label: 'Technology', icon: Search },
    { id: 'map',        label: 'Map',        icon: Map },
] as const;

const INSIGHT_IDS = INSIGHT_OPTIONS.map((o) => o.id) as readonly string[];

interface ProjectsMobileToggleProps {
    activePrefilter: string;
    onPrefilterChange: (next: string) => void;
}

export function ProjectsMobileToggle({
                                         activePrefilter,
                                         onPrefilterChange,
                                     }: ProjectsMobileToggleProps) {
    const isList     = activePrefilter === 'all-projects';
    const isInsights = INSIGHT_IDS.includes(activePrefilter);

    const handleSelectList = () => {
        if (!isList) onPrefilterChange('all-projects');
    };

    const handleSelectInsights = () => {
        if (!isInsights) onPrefilterChange('spending');
    };

    return (
        <div className="mb-4 lg:hidden">
            {/* Segmented control */}
            <div
                role="tablist"
                aria-label="View mode"
                className="flex gap-1 rounded-xl bg-slate-100 p-1"
            >
                <SegmentButton
                    active={isList}
                    onClick={handleSelectList}
                    icon={<LayoutList className="h-4 w-4" />}
                    label="List"
                />
                <SegmentButton
                    active={isInsights}
                    onClick={handleSelectInsights}
                    icon={<Sparkles className="h-4 w-4" />}
                    label="Insights"
                />
            </div>

            {isInsights && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6 -mx-4 sm:-mx-6 overflow-x-auto px-4 sm:px-6"
                >
                    <div className="flex gap-2 pb-1">
                        {INSIGHT_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = activePrefilter === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => onPrefilterChange(opt.id)}
                                    className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'border-slate-900 bg-slate-900 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

interface SegmentButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function SegmentButton({ active, onClick, icon, label }: SegmentButtonProps) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            {active && (
                <motion.span
                    layoutId="segmented-active-bg"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
                {icon}
                {label}
            </span>
        </button>
    );
}