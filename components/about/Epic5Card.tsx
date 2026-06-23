"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";

interface Epic5CardProps {
    href?: string;
    delay?: number;
}

const highlights = [
    { value: "2026 – 2030", label: "Investment period", accentColor: "#0284c7" },
];

const timeline = [
    {
        date: "Summer 2023",
        label: "Strategic planning begins",
        text: "The CPUC launched a strategic planning process to establish goals, objectives, and metrics for the next generation of EPIC investments.",
    },
    {
        date: "March 7, 2024",
        label: "Strategic Goals adopted",
        text: "The CPUC adopted Strategic Goals to guide the overall direction of EPIC investments through the EPIC 5 cycle and beyond.",
    },
    {
        date: "February 26, 2026",
        label: "Strategic Objectives adopted",
        text: "Clear, measurable, and robust targets to guide investment plan strategies and deploy innovation aligned with EPIC's Strategic Goals.",
    },
];

export default function Epic5Card({
                                      href = "https://www.epicpartnership.org/epic5.html",
                                      delay = 0,
                                  }: Epic5CardProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            {/* Section header */}
            <div className="mb-10 flex items-center gap-3">
                <span
                    aria-hidden
                    className="block h-2 w-2 rounded-sm"
                    style={{
                        background: "linear-gradient(135deg, #059669, #e11d48)",
                    }}
                />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">
                    Current cycle
                </span>
                <span className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Title + description  |  Key figures */}
            <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-6">
                    <h2 className="mb-3 text-[1.625rem] font-semibold leading-[1.3] tracking-tight text-gray-900">
                        EPIC 5
                    </h2>
                    <p className="text-[15px] leading-[1.75] text-gray-500">
                        The current investment cycle introduces a strategic framework
                        of goals and measurable objectives — the first time EPIC has
                        operated under this structured approach.
                    </p>
                    <Link
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={
                            href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                        }
                        className="mt-4 inline-flex items-center text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
                    >
                        Learn more about EPIC 5 →
                    </Link>
                </div>

                {/* Key figures with gradient underlines */}
                <div className="flex flex-wrap items-start gap-8 lg:col-span-5 lg:col-start-8 lg:gap-10 lg:pt-1">
                    {highlights.map((h) => (
                        <div key={h.label}>
                            <div className="mb-2 inline-block">
                                <p className="text-2xl font-semibold tracking-tight text-gray-900 lg:text-[1.75rem]">
                                    {h.value}
                                </p>
                                <div
                                    aria-hidden
                                    className="mt-1 h-[2px] w-full rounded-full"
                                    style={{
                                        background: `linear-gradient(to right, ${h.accentColor}, transparent)`,
                                        opacity: 0.4,
                                    }}
                                />
                            </div>
                            <p className="text-sm text-gray-500">{h.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* EPIC 5 development timeline */}
            <div className="rounded-lg bg-gray-50 p-8 lg:p-10">
                <p className="mb-6 text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">
                    EPIC 5 Development
                </p>

                <div className="relative">

                    <div
                        aria-hidden
                        className="absolute left-0 right-0 top-[5px] h-px"
                        style={{
                            background:
                                "linear-gradient(to right, #0284c7, #059669, #e11d48)",
                            opacity: 0.2,
                        }}
                    />

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
                        {timeline.map((entry, i) => (
                            <div key={entry.date} className="relative pt-6">
                                <span
                                    aria-hidden
                                    className="absolute top-0 left-0 h-[11px] w-[11px] rounded-full border-2 border-gray-50"
                                    style={{
                                        background:
                                            i === 0
                                                ? "#0284c7"
                                                : i === 1
                                                    ? "#059669"
                                                    : "#e11d48",
                                    }}
                                />

                                <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.1em] text-gray-400">
                                    {entry.date}
                                </p>
                                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                                    {entry.label}
                                </h3>
                                <p className="text-[13px] leading-[1.7] text-gray-500">
                                    {entry.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}