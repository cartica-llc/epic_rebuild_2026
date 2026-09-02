"use client";

import React from "react";
import { motion } from "motion/react";

interface Stat {
    value: string;
    label: string;
    sublabel?: string;
    accentColor?: string;
}

interface StatsRowProps {
    stats?: Stat[];
    delay?: number;
}

const defaultStats: Stat[] = [
    {
        value: "$3.4B",
        label: "Total investment",
        sublabel: "Since 2012",
        accentColor: "#0284c7",
    },
    {
        value: "16",
        label: "Investment areas",
        sublabel: "Across 5 categories",
        accentColor: "#059669",
    },
    {
        value: "4",
        label: "Program Administrators",
        sublabel: "CEC · PG&E · SCE · SDG&E",
        accentColor: "#e11d48",
    },
];

export default function StatsRow({ stats = defaultStats, delay = 0 }: StatsRowProps) {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay }}
            className="relative overflow-hidden border-y border-gray-100 bg-gray-50/70 py-10"
        >
            {/* Subtle grid texture */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgb(15 23 42) 1px, transparent 1px), linear-gradient(to right, rgb(15 23 42) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                }}
            />

            <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-3">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: delay + i * 0.06,
                            }}
                            className={`px-1 lg:px-6 ${
                                i > 0 ? "lg:border-l lg:border-gray-200/80" : ""
                            }`}
                        >
                            {/* Value with gradient underline */}
                            <div className="mb-2 inline-block">
                                <p className="text-3xl font-semibold tracking-tight text-gray-900 lg:text-[2rem]">
                                    {stat.value}
                                </p>
                                <div
                                    aria-hidden
                                    className="mt-1 h-[2px] w-full rounded-full"
                                    style={{
                                        background: `linear-gradient(to right, ${stat.accentColor}, transparent)`,
                                        opacity: 0.4,
                                    }}
                                />
                            </div>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            {stat.sublabel && (
                                <p className="mt-0.5 text-[11px] font-mono text-gray-400">
                                    {stat.sublabel}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}