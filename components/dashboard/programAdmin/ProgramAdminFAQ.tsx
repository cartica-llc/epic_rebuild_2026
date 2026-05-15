// components/dashboard/programAdmin/ProgramAdminFAQ.tsx
'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, X, PlayCircle } from 'lucide-react';

const faqItems = [
    {
        title: 'Create a project',
        description:
            'Click “Create Project,” fill out the core project details, assign the correct team or program area, and submit the project.',
        gifSrc: '/images/faqs/create-project.gif',
    },
    {
        title: 'Edit a project',
        description:
            'Open an active project from your dashboard, then use the edit option to update project details, timelines, or descriptions.',
        gifSrc: '/images/faqs/edit-project.gif',
    },
    {
        title: 'Export project listings',
        description:
            'Use the “Export” button above the project table to download the current listings as a CSV file.',
        gifSrc: '/images/faqs/export-projects.gif',
    },
];

export function ProgramAdminFAQ() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

    const selectedFAQ =
        selectedQuestionIndex !== null ? faqItems[selectedQuestionIndex] : null;

    const handleToggleOpen = () => {
        setIsOpen((prev) => !prev);

        if (isOpen) {
            setSelectedQuestionIndex(null);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedQuestionIndex(null);
    };

    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
            <button
                type="button"
                onClick={handleToggleOpen}
                className="group flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600 ring-1 ring-slate-200 transition group-hover:bg-white">
                        <HelpCircle className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Help Guides
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Quick walkthroughs for common project tasks.
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition group-hover:bg-white">
                    {isOpen ? 'Hide help' : 'Need help?'}
                    <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="border-t border-slate-200 px-5 pb-5 pt-4 sm:px-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Select a walkthrough
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Choose a guide below to view the steps.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close help guides"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        {faqItems.map((item, index) => {
                            const isActive = selectedQuestionIndex === index;

                            return (
                                <button
                                    key={item.title}
                                    type="button"
                                    onClick={() =>
                                        setSelectedQuestionIndex(isActive ? null : index)
                                    }
                                    className={`rounded-xl px-4 py-3 text-left ring-1 transition ${
                                        isActive
                                            ? 'bg-slate-900 text-white ring-slate-900 shadow-sm'
                                            : 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100 hover:ring-slate-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <PlayCircle
                                            className={`mt-0.5 h-5 w-5 shrink-0 ${
                                                isActive ? 'text-slate-300' : 'text-slate-500'
                                            }`}
                                        />

                                        <div>
                                            <h4
                                                className={`text-sm font-semibold ${
                                                    isActive ? 'text-white' : 'text-slate-900'
                                                }`}
                                            >
                                                {item.title}
                                            </h4>
                                            <p
                                                className={`mt-1 text-sm ${
                                                    isActive ? 'text-slate-300' : 'text-slate-500'
                                                }`}
                                            >
                                                View walkthrough
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedFAQ && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,520px)] lg:items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                        <PlayCircle className="h-3.5 w-3.5" />
                                        Walkthrough
                                    </div>

                                    <h3 className="mt-3 text-base font-semibold text-slate-900">
                                        {selectedFAQ.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {selectedFAQ.description}
                                    </p>
                                </div>

                                <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                                    <div className="aspect-video max-h-[240px] w-full bg-slate-100">
                                        <img
                                            src={selectedFAQ.gifSrc}
                                            alt={selectedFAQ.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}