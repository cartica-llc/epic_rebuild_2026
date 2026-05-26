// components/docs/HowToSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { brandGradientBorder } from './brand';
import HOW_TO_ITEMS from './howToItems.json';

interface HowToItem {
    id: string;
    title: string;
    description: string;
    steps: string[];
    videoSrc?: string;
    videoAlt?: string;
    tag?: string;
}

function QuestionCard({
                          item,
                          isActive,
                          onClick,
                      }: {
    item: HowToItem;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`relative w-full rounded-xl border bg-white text-left transition-all ${
                isActive ? 'border-transparent' : 'border-slate-200 hover:border-slate-300'
            }`}
        >
            {isActive && (
                <div
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    style={brandGradientBorder}
                />
            )}
            <div className="flex flex-col justify-between p-3">
                <span className={`text-xs font-semibold leading-snug ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {item.title}
                </span>
            </div>
        </button>
    );
}

export function HowToSection() {
    const items = HOW_TO_ITEMS as HowToItem[];
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mobileExpanded, setMobileExpanded] = useState(false);

    // Derive selected item directly from URL — no setState needed
    const guideParam = searchParams.get('guide');
    const selected = items.find((i) => i.id === guideParam) ?? null;

    // Scroll into view when arriving via a shared link
    useEffect(() => {
        if (guideParam) {
            const el = document.getElementById('how-to-section');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    const selectItem = (item: HowToItem) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('guide', item.id);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <section id="how-to-section" className="py-14">
            {/* Section header */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900">How-To Guides</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Step-by-step walkthroughs with video previews for common tasks in the EPIC Database.
                </p>
            </div>

            {/* ── Desktop: horizontal scrollable strip ── */}
            <div
                className="hidden sm:flex gap-3 overflow-x-auto pb-2 mb-6"
                style={{ scrollbarWidth: 'none' }}
            >
                {items.map((item) => (
                    <div key={item.id} className="shrink-0 w-44">
                        <QuestionCard
                            item={item}
                            isActive={selected?.id === item.id}
                            onClick={() => selectItem(item)}
                        />
                    </div>
                ))}
            </div>

            {/* ── Mobile: current selection + "View all" toggle → 2-col grid ── */}
            <div className="sm:hidden mb-4 space-y-3">
                {/* Current selection pill — only shown once a guide is selected */}
                {selected && (
                    <div className="relative rounded-xl border-transparent">
                        <QuestionCard
                            item={selected}
                            isActive={true}
                            onClick={() => {}}
                        />
                    </div>
                )}

                {/* View all toggle */}
                <button
                    onClick={() => setMobileExpanded((p) => !p)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                    <span className="text-sm font-medium text-slate-600">
                        {mobileExpanded ? 'Close' : `View all ${items.length} guides`}
                    </span>
                    <motion.div animate={{ rotate: mobileExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </motion.div>
                </button>

                {/* 2-col grid of all questions */}
                <AnimatePresence initial={false}>
                    {mobileExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                {items.map((item) => (
                                    <QuestionCard
                                        key={item.id}
                                        item={item}
                                        isActive={selected?.id === item.id}
                                        onClick={() => {
                                            selectItem(item);
                                            setMobileExpanded(false);
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {selected && (
                    <motion.div
                        key={selected.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="rounded-xl border border-slate-100 bg-white p-6"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">{selected.title}</h3>
                                <p className="mt-1 text-sm text-slate-500">{selected.description}</p>
                            </div>
                            {selected.tag && (
                                <span className="hidden shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                    {selected.tag}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div>
                                <p className="!select-none mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Steps</p>
                                <ol className="space-y-3">
                                    {selected.steps.map((step, i) => (
                                        <li key={i} className="flex gap-3 text-[13px] text-slate-600">
                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div>
                                <p className="!select-none mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Walkthrough</p>
                                <div
                                    className="pointer-events-none select-none overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                                    style={{ aspectRatio: '16 / 9' }}
                                >
                                    {selected.videoSrc ? (
                                        <video
                                            key={selected.videoSrc}
                                            src={selected.videoSrc}
                                            aria-label={selected.videoAlt ?? selected.title}
                                            className="pointer-events-none h-full w-full select-none object-cover"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            controls={false}
                                            disablePictureInPicture
                                            controlsList="nodownload noplaybackrate nofullscreen"
                                            tabIndex={-1}
                                            draggable={false}
                                            onContextMenu={(e) => e.preventDefault()}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                            Video coming soon
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}