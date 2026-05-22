"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { brandGradientBorder } from "./brandGradient";

interface Epic5CardProps {
    href?: string;
    delay?: number;
}

const highlights = [
    { label: "Investment Period", value: "2026 – 2030" },
    { label: "Strategic Goals", value: "5" },
    { label: "Strategic Objectives", value: "13" },
    { label: "Approx. Funding", value: "~$1B" },
];

export default function Epic5Card({
    href = "https://www.epicpartnership.org/epic5.html",
    delay = 0,
}: Epic5CardProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="group relative rounded-xl bg-gray-50/50 shadow-sm overflow-hidden"
        >
            <div className="pointer-events-none absolute inset-0 rounded-xl" style={brandGradientBorder} />

            <div className="relative z-10 p-8 lg:p-10">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                    {/* Left: title + description */}
                    <div className="lg:col-span-7">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-3 py-1 text-xs font-mono text-gray-500 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                            Current Cycle
                        </div>

                        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-gray-900">
                            EPIC 5
                        </h2>
                        <p className="mb-2 text-sm font-mono text-gray-400">
                            Investment Period · 2026 – 2030
                        </p>

                        <p className="text-base leading-relaxed text-gray-600 mb-6">
                            The CPUC launched a strategic planning process for the Electric Program Investment Charge Program in Summer 2023 to establish goals, objectives, and metrics for approximately $1 billion in ratepayer-funded RD&amp;D programs for the EPIC 5 program cycle.
                        </p>

                        <Link
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700"
                        >
                            Learn more about EPIC 5
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Right: stat tiles */}
                    <div className="lg:col-span-5">
                        <div className="grid grid-cols-2 gap-3">
                            {highlights.map((h, i) => (
                                <motion.div
                                    key={h.label}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: delay + 0.1 + i * 0.05 }}
                                    className="rounded-lg border border-gray-100 bg-white p-4"
                                >
                                    <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-gray-400">
                                        {h.label}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 leading-tight">
                                        {h.value}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
