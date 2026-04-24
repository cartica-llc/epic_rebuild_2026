'use client';

import { motion } from 'motion/react';
import { X } from 'lucide-react';
import {
    Insight_SpendingAnalysis,
    Insight_StagesCommercialization,
    Insight_TechnologySearch,
    Insight_LocationInsights,
} from './insights';

interface QuickQueryVisualizationProps {
    activeQuery: string;
    onCategoryFilter?: (category: string | null) => void;
    onClose?: () => void;
}

export function QuickQueryVisualization({
                                            activeQuery,
                                            onCategoryFilter,
                                            onClose,
                                        }: QuickQueryVisualizationProps) {
    if (!activeQuery) return null;

    const renderInsightContent = () => {
        switch (activeQuery) {
            case 'spending':
                return <Insight_SpendingAnalysis />;
            case 'market':
                return <Insight_StagesCommercialization />;
            case 'technology':
                return <Insight_TechnologySearch />;
            case 'map':
                return <Insight_LocationInsights />;
            default:
                return (
                    <div className="py-12 text-center text-slate-500">
                        <p className="text-sm">No insights available for this query</p>
                    </div>
                );
        }
    };

    const getHeaderInfo = () => {
        switch (activeQuery) {
            case 'spending':
                return {
                    title: 'Spending Analysis',
                    description: 'Explore EPIC spending across time, administrators, plan periods, and investment areas.',
                };
            case 'market':
                return {
                    title: 'Market Maturity Analysis',
                    description: 'See where projects are in development and which ones show signs of being close to market.',
                };
            case 'technology':
                return {
                    title: 'Technology & Learnings Search',
                    description: 'Search similar EPIC projects by topic, innovation, or barrier.',
                };
            case 'map':
                return {
                    title: 'Project Map',
                    description: 'Explore projects by location and see funding distribution across regions.',
                };
            default:
                return {
                    title: 'Quick Insights',
                    description: 'Explore EPIC data insights',
                };
        }
    };

    const headerInfo = getHeaderInfo();

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
                        <h3 className="text-lg font-bold text-slate-900">{headerInfo.title}</h3>
                        <p className="mt-0.5 text-sm text-slate-600">{headerInfo.description}</p>
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
                <div className="px-1 sm:px-0">{renderInsightContent()}</div>
            </div>
        </motion.div>
    );
}