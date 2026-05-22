// components/docs/HowToSection.tsx
'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { brandGradientBorder } from './brand';

interface HowToItem {
    id: string;
    title: string;
    description: string;
    steps: string[];
    gifSrc?: string;
    gifAlt?: string;
    tag?: string;
}

const HOW_TO_ITEMS: HowToItem[] = [
    {
        id: 'sign-in',
        title: 'How to Sign In',
        tag: 'Auth',
        description: 'Access the EPIC Database as a user.',
        steps: [
            'Navigate to the EPIC Database login modal.',
            'Enter your organization email address.',
            'Enter your password and click Sign In.',
            'You will be redirected to the dashboard based on your organization and role.',
        ],
        gifSrc: '/docs/gifs/sign-in.gif',
        gifAlt: 'Animated walkthrough of the sign-in flow',
    },
    {
        id: 'create-project',
        title: 'How to Create a Project',
        tag: 'Projects',
        description: 'Submit a new EPIC-funded project into the database with all required fields.',
        steps: [
            'From the dashboard, click the "+ New Project" button in the top-right.',
            'Fill in the General Info tab: project name, number, investment area, and utility.',
            'Complete the Finance tab with award amounts, match funding, and funding split.',
            'Add at least one team member in the Contacts tab.',
            'Click Save. The system will validate stage requirements and flag any missing fields.',
        ],
        gifSrc: '/docs/gifs/create-project.gif',
        gifAlt: 'Animated walkthrough of creating a new project',
    },
    {
        id: 'edit-project',
        title: 'How to Edit a Project',
        tag: 'Projects',
        description: "Update an existing project's fields, status, or attachments at any time.",
        steps: [
            'Search for the project on the Projects list page using filters or the search bar.',
            'Click the project row to open the detail view.',
            'Click the Edit button (visible if you have edit permissions for this org).',
            'Make your changes across the tabs. The progress bar updates in real time.',
            'Click Save to persist changes. A success overlay will confirm the save.',
        ],
        gifSrc: '/docs/gifs/edit-project.gif',
        gifAlt: 'Animated walkthrough of editing a project',
    },
    {
        id: 'export-data',
        title: 'How to Export Projects',
        tag: 'Data',
        description: 'Download a filtered or full project list as a multi-sheet Excel workbook.',
        steps: [
            'Go to the Projects list page.',
            'Apply any filters you want (investment area, utility, status, etc.).',
            'Click the Export button in the top toolbar.',
            'Choose "Current view" to export filtered results or "Full export" for all records.',
            'The .xlsx file will download automatically with data, lookups, and a summary sheet.',
        ],
        gifSrc: '/docs/gifs/export.gif',
        gifAlt: 'Animated walkthrough of exporting projects to Excel',
    }
];

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
            <div className="flex  flex-col justify-between p-3">
                {/*<span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">*/}
                {/*    {item.tag}*/}
                {/*</span>*/}
                <span className={`text-xs font-semibold leading-snug ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {item.title}
                </span>
            </div>
        </button>
    );
}

export function HowToSection() {
    const [selected, setSelected] = useState<HowToItem>(HOW_TO_ITEMS[0]);
    const [mobileExpanded, setMobileExpanded] = useState(false);

    return (
        <section className="py-14">
            {/* Section header */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900">How-To Guides</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Step-by-step walkthroughs with animated previews for common tasks in the EPIC Database.
                </p>
            </div>

            {/* ── Desktop: horizontal scrollable strip ── */}
            <div
                className="hidden sm:flex gap-3 overflow-x-auto pb-2 mb-6"
                style={{ scrollbarWidth: 'none' }}
            >
                {HOW_TO_ITEMS.map((item) => (
                    <div key={item.id} className="shrink-0 w-44">
                        <QuestionCard
                            item={item}
                            isActive={selected.id === item.id}
                            onClick={() => setSelected(item)}
                        />
                    </div>
                ))}
            </div>

            {/* ── Mobile: current selection + "View all" toggle → 2-col grid ── */}
            <div className="sm:hidden mb-4 space-y-3">
                {/* Current selection pill */}
                <div className="relative rounded-xl border-transparent" >
                    <QuestionCard
                        item={selected}
                        isActive={true}
                        onClick={() => {}}
                    />
                </div>

                {/* View all toggle */}
                <button
                    onClick={() => setMobileExpanded((p) => !p)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                    <span className="text-sm font-medium text-slate-600">
                        {mobileExpanded ? 'Close' : `View all ${HOW_TO_ITEMS.length} guides`}
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
                                {HOW_TO_ITEMS.map((item) => (
                                    <QuestionCard
                                        key={item.id}
                                        item={item}
                                        isActive={selected.id === item.id}
                                        onClick={() => {
                                            setSelected(item);
                                            setMobileExpanded(false);
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Detail panel ── */}
            <AnimatePresence mode="wait">
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
                            <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                {selected.tag}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div>
                            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Steps</p>
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
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Walkthrough</p>
                            <div
                                className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                                style={{ aspectRatio: '16 / 9' }}
                            >
                                {selected.gifSrc ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={selected.gifSrc}
                                        alt={selected.gifAlt ?? selected.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                        GIF coming soon
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
}