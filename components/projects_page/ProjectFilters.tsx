'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface ProjectFiltersProps {
    activePrefilter: string;
    onPrefilterChange: (id: string) => void;
    initialPrefilter?: string;
}

const prefilterQueries = [
    { id: 'spending', label: 'Spending', description: 'Track spending & compliance' },
    { id: 'technology', label: 'Key Learnings', description: 'Browse by topic & expertise' },
    { id: 'map', label: 'Project Map', description: 'Map / district view' },
    { id: 'market', label: 'Market Maturity', description: "Where projects are and who's close to market" },
    { id: 'all-projects', label: 'Browse all projects', description: 'Full project database' },
];

export function ProjectFilters({
                                   activePrefilter,
                                   onPrefilterChange,
                                   initialPrefilter,
                               }: ProjectFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const sidebarRef = useRef<HTMLDivElement | null>(null);

    // Sticky sidebar scroll logic
    useEffect(() => {
        const topOffset = 96;
        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            const sidebar = sidebarRef.current;
            if (!wrapper || !sidebar) return;
            const wrapperRect = wrapper.getBoundingClientRect();
            const sidebarHeight = sidebar.offsetHeight;
            const scrolledPast = topOffset - wrapperRect.top;
            if (scrolledPast <= 0) {
                sidebar.style.transform = 'translateY(0px)';
            } else {
                const maxTranslate = wrapper.offsetHeight - sidebarHeight;
                const translate = Math.min(scrolledPast, Math.max(0, maxTranslate));
                sidebar.style.transform = `translateY(${translate}px)`;
            }
        };
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const setup = () => {
            if (mediaQuery.matches) {
                window.addEventListener('scroll', handleScroll, { passive: true });
                window.addEventListener('resize', handleScroll, { passive: true });
                handleScroll();
            } else {
                if (sidebarRef.current) sidebarRef.current.style.transform = '';
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleScroll);
            }
        };
        setup();
        mediaQuery.addEventListener('change', setup);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            mediaQuery.removeEventListener('change', setup);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = showFilters ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showFilters]);

    useEffect(() => {
        if (initialPrefilter && !activePrefilter) handlePrefilter(initialPrefilter);
    }, [initialPrefilter, activePrefilter]);

    const handlePrefilter = (id: string) => {
        if (activePrefilter === id) { clearPrefilter(); return; }
        onPrefilterChange(id);
        setShowFilters(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearPrefilter = () => {
        onPrefilterChange('all-projects');
    };

    const filterContent = (
        <div className="space-y-3 pr-2">
            <div>
                <div className="mb-3 hidden lg:block">
                    <div className="flex items-start gap-2">
                        <Zap className="mt-0.5 h-6 w-6 flex-shrink-0" style={{ stroke: 'url(#zapGradientDesktop)', fill: 'url(#zapGradientDesktop)' }} />
                        <div className="flex-1">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">Quick Insights</h3>
                            <p className="mt-0.5 text-[0.625rem] text-slate-600">Select a view</p>
                        </div>
                        <svg width="0" height="0" className="absolute">
                            <defs>
                                <linearGradient id="zapGradientDesktop" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0284c7" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {prefilterQueries.map((query) => (
                        <button
                            key={query.id}
                            type="button"
                            onClick={() => handlePrefilter(query.id)}
                            onDoubleClick={clearPrefilter}
                            className="group relative w-full rounded-lg px-4 py-3 text-left transition-all"
                        >
                            {activePrefilter === query.id && (
                                <span className="absolute left-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-600 via-emerald-600 to-rose-600" />
                            )}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className={`mb-1 text-sm font-bold ${activePrefilter === query.id ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                        {query.label}
                                    </div>
                                    <div className={`text-xs ${activePrefilter === query.id ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-600'}`}>
                                        {query.description}
                                    </div>
                                </div>
                                {activePrefilter === query.id && (
                                    <div className="flex-shrink-0">
                                        <Zap className="h-5 w-5" style={{ stroke: 'url(#zapGradientActive)', fill: 'url(#zapGradientActive)' }} />
                                        <svg width="0" height="0" className="absolute">
                                            <defs>
                                                <linearGradient id="zapGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#0284c7" />
                                                    <stop offset="100%" stopColor="#059669" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile FAB */}
            <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-emerald-600 p-3 text-white shadow-lg transition-shadow hover:shadow-xl lg:hidden"
            >
                <Zap className="h-5 w-5" />
                <span className="text-xs font-medium">Insights</span>
            </button>

            {/* Mobile drawer */}
            <AnimatePresence mode="wait">
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setShowFilters(false)}
                            className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 top-0 z-[70] h-screen w-64 overflow-y-auto rounded-r-2xl bg-white shadow-2xl lg:hidden"
                        >
                            <div className="flex h-full flex-col">
                                <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6">
                                    <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600" />
                                    <div className="flex items-start gap-3">
                                        <Zap className="mt-0.5 h-8 w-8" style={{ stroke: 'url(#zapGradientMobile)', fill: 'url(#zapGradientMobile)' }} />
                                        <svg width="0" height="0" className="absolute">
                                            <defs>
                                                <linearGradient id="zapGradientMobile" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#0284c7" />
                                                    <stop offset="100%" stopColor="#059669" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="flex-1 text-left">
                                            <h2 className="text-xs font-semibold leading-tight text-slate-900">Quick Insights</h2>
                                            <p className="mt-0.5 text-[0.625rem] text-slate-600">Select a view</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 pb-4">{filterContent}</div>
                                <div className="mt-auto border-t border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <Image src="/logo/CAgov-logo.svg" alt="California Government Logo" width={40} height={40} className="h-10 w-auto object-contain" />
                                        <div className="text-center">
                                            <p className="text-[0.625rem] font-semibold text-slate-900">California Energy Commission</p>
                                            <p className="mt-0.5 text-[0.625rem] text-slate-600">Infrastructure Portfolio</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <div ref={wrapperRef} className="hidden h-full lg:block">
                <div ref={sidebarRef} className="will-change-transform flex flex-col rounded-2xl border-2 border-slate-200 bg-white/50 p-6 backdrop-blur-sm">
                    <div className="flex-1">{filterContent}</div>
                </div>
            </div>
        </>
    );
}