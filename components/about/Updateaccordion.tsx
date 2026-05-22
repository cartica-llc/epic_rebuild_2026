"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

interface UpdateAccordionProps {
    date?: string;
    headline?: string;
    decisionRef?: string;
    body?: React.ReactNode;
    epic5Href?: string;
    defaultOpen?: boolean;
}

export default function UpdateAccordion({
                                            date = "February 26, 2026",
                                            headline = "CPUC adopts 13 Strategic Objectives for EPIC 5",
                                            decisionRef = "D.26-02-037",
                                            epic5Href = "https://www.epicpartnership.org/epic5.html",
                                            body,
                                            defaultOpen = false,
                                        }: UpdateAccordionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="overflow-hidden rounded-b-3xl border border-t-0 border-gray-100 bg-white">
            {/* Thin brand accent line connecting it to the hero */}
            <div className="h-px w-full bg-gradient-to-r from-sky-500/40 via-emerald-500/40 to-rose-500/40" />

            {/* Header row — always visible */}
            <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50/50 lg:px-10"
            >


                <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                            Update · {date}
                        </span>
                        {!open && (
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                            </span>
                        )}
                    </div>
                    <p className="truncate text-sm font-semibold text-gray-900">
                        {headline}
                    </p>
                </div>

                <motion.svg
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-5 w-5 shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>

            {/* Expandable body */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-7 pl-6 lg:px-10 lg:pl-[5.5rem]">
                            <p className="mb-3 text-[11px] font-mono uppercase tracking-wider text-gray-400">
                                CPUC Decision · {decisionRef}
                            </p>
                            <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
                                {body ?? (
                                    <>
                                        The CPUC adopted a set of 13 Strategic Objectives to guide investments in the EPIC 5 investment period (2026–2030). Strategic Objectives are clear, measurable, and robust targets to guide EPIC investment plan strategies to scale and deploy innovation to align with EPIC's Strategic Goals, which were adopted on March 7, 2024.
                                    </>
                                )}
                            </p>
                            <Link
                                href={epic5Href}
                                target={epic5Href.startsWith("http") ? "_blank" : undefined}
                                rel={epic5Href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
                            >
                                Learn more about EPIC 5
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}