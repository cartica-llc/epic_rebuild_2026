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
        <div className="mx-auto max-w-5xl px-6 py-6 lg:px-8">
            <div className="relative overflow-hidden rounded-lg bg-gray-50">
                {/* Gradient left accent */}
                <div
                    aria-hidden
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{
                        background:
                            "linear-gradient(to bottom, #0284c7, #059669, #e11d48)",
                    }}
                />

                <button
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    className="group flex w-full items-center gap-4 px-6 py-4 text-left"
                >
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-sky-600">
                                Regulatory Update
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">
                                · {date}
                            </span>
                        </div>
                        <p className="truncate text-sm font-medium text-gray-900">
                            {headline}
                        </p>
                    </div>

                    <motion.svg
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </motion.svg>
                </button>

                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="border-t border-gray-200/60 px-6 pb-5 pt-4">
                                <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">
                                    CPUC Decision · {decisionRef}
                                </p>
                                <p className="mb-4 max-w-2xl text-[15px] leading-[1.75] text-gray-600">
                                    {body ?? (
                                        <>
                                            The CPUC adopted a set of 13 Strategic Objectives to
                                            guide investments in the EPIC 5 investment period
                                            (2026–2030). Strategic Objectives are clear, measurable,
                                            and robust targets to guide EPIC investment plan
                                            strategies to scale and deploy innovation to align with
                                            EPIC&#39;s Strategic Goals, which were adopted on March
                                            7, 2024.
                                        </>
                                    )}
                                </p>
                                <Link
                                    href={epic5Href}
                                    target={
                                        epic5Href.startsWith("http") ? "_blank" : undefined
                                    }
                                    rel={
                                        epic5Href.startsWith("http")
                                            ? "noopener noreferrer"
                                            : undefined
                                    }
                                    className="text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
                                >
                                    Learn more about EPIC 5 →
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}