// components/projects_page/QuickQueryVisualization.tsx

'use client';

import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface QuickQueryVisualizationProps {
    activeQuery: string;
    onClose?: () => void;
    onCategoryFilter?: (category: string | null) => void;
}

const insightSkeleton = () => (
    <div className="space-y-5 px-4 py-6 md:px-6 md:py-8">
        <div className="h-7 w-72 animate-pulse rounded bg-slate-100" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[68px] animate-pulse rounded-md bg-slate-50" />
            ))}
        </div>
        <div className="h-9 w-full animate-pulse rounded bg-slate-50" />
        <div className="h-[300px] animate-pulse rounded-md border border-slate-200 bg-slate-50" />
    </div>
);

const Insight_SpendingAnalysis = dynamic(
    () =>
        import('./insights/Insight_SpendingAnalysis').then(
            (m) => m.Insight_SpendingAnalysis,
        ),
    { loading: insightSkeleton, ssr: false },
);

const Insight_Market = dynamic(
    () =>
        import('./insights/Insight_Market').then((m) => m.Insight_Market),
    { loading: insightSkeleton, ssr: false },
);

const Insight_Learnings = dynamic(
    () =>
        import('./insights/Insight_Learnings').then(
            (m) => m.Insight_Learnings,
        ),
    { loading: insightSkeleton, ssr: false },
);

const Insight_Map = dynamic(
    () => import('./insights/Insight_Map').then((m) => m.Insight_Map),
    { loading: insightSkeleton, ssr: false },
);

const HEADER_INFO: Record<string, { title: string; description: string }> = {
    spending: {
        title: 'Spending Analysis',
        description:
            'Explore EPIC spending across time, administrators, plan periods, and investment areas.',
    },
    market: {
        title: 'Market Maturity Analysis',
        description:
            'See where projects are in development and which ones show signs of being close to market.',
    },
    technology: {
        title: 'Technology & Learnings Search',
        description: 'Search similar EPIC projects by topic, innovation, or barrier.',
    },
    map: {
        title: 'Project Map',
        description: 'Explore projects by location and see funding distribution across regions.',
    },
};

export function QuickQueryVisualization({
                                            activeQuery,
                                            onClose,
                                        }: QuickQueryVisualizationProps) {
    if (!activeQuery) return null;

    const headerInfo = HEADER_INFO[activeQuery] ?? {
        title: 'Quick Insights',
        description: 'Explore EPIC data insights',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
        >
            <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b-2 border-slate-200 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {headerInfo.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-600">
                            {headerInfo.description}
                        </p>
                    </div>

                    <motion.button
                        type="button"
                        onClick={onClose}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-slate-600 transition-colors hover:text-slate-900"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </motion.button>
                </div>

                <div className="px-1 sm:px-0">
                    {activeQuery === 'spending' && <Insight_SpendingAnalysis />}
                    {activeQuery === 'market' && <Insight_Market />}

                    {activeQuery === 'technology' && <Insight_Learnings />}
                    {activeQuery === 'map' && <Insight_Map />}
                    {!['spending', 'market', 'technology', 'map'].includes(
                        activeQuery,
                    ) && (
                        <div className="py-12 text-center text-slate-500">
                            <p className="text-sm">
                                No insights available for this query
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
