"use client";

import React from "react";
import { motion } from "motion/react";

interface Stat {
    value: string;
    label: string;
    sublabel?: string;
}

interface StatsRowProps {
    stats?: Stat[];
    delay?: number;
}

const defaultStats: Stat[] = [
    { value: "$3.4B", label: "Invested in innovation", sublabel: "2012 – 2030" },
    { value: "13", label: "Strategic Objectives", sublabel: "EPIC 5" },
    { value: "5", label: "Strategic Goals", sublabel: "Adopted 2024" },
    { value: "4", label: "Program Administrators", sublabel: "CEC, PG&E, SCE, SDG&E" },
];

export default function StatsRow({ stats = defaultStats, delay = 0 }: StatsRowProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-100 bg-gray-100 lg:grid-cols-4"
        >
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: delay + 0.05 + i * 0.05 }}
                    className="bg-white p-6 lg:p-7"
                >
                    <p className="mb-2 text-3xl font-semibold tracking-tight text-gray-900 lg:text-4xl">
                        {stat.value}
                    </p>
                    <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                    {stat.sublabel && (
                        <p className="mt-1 text-xs font-mono text-gray-400">{stat.sublabel}</p>
                    )}
                </motion.div>
            ))}
        </motion.section>
    );
}
