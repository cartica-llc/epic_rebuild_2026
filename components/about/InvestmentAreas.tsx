"use client";

import React from "react";
import { motion } from "motion/react";

interface AreaGroup {
    theme: string;
    color: string;
    areas: string[];
}

const groups: AreaGroup[] = [
    {
        theme: "Climate Adaptation & Grid Resilience",
        color: "#e11d48",
        areas: [
            "Grid modernization",
            "Grid resiliency and safety",
            "Cybersecurity",
            "Wildfire mitigation",
        ],
    },
    {
        theme: "Distributed Energy Resources",
        color: "#0284c7",
        areas: [
            "Grid decentralization",
            "Grid optimization",
            "Smart grid technology",
            "Distributed energy resource integration",
            "Demand reduction",
            "Entrepreneurial ecosystems",
        ],
    },
    {
        theme: "Transportation Electrification & Energy Storage",
        color: "#7c3aed",
        areas: [
            "Transportation electrification",
            "Energy storage",
        ],
    },
    {
        theme: "Buildings",
        color: "#d97706",
        areas: [
            "Building decarbonization",
            "Industrial and agricultural innovation",
        ],
    },
    {
        theme: "Decarbonization",
        color: "#059669",
        areas: [
            "Grid decarbonization",
            "High penetration renewable energy integration",
        ],
    },
];

interface InvestmentAreasProps {
    delay?: number;
}

export default function InvestmentAreas({ delay = 0 }: InvestmentAreasProps) {
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
                        background: "linear-gradient(135deg, #0284c7, #e11d48)",
                    }}
                />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">
                    Investment Areas
                </span>
                <span className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="mb-10 max-w-2xl">
                <h2 className="mb-3 text-[1.625rem] font-semibold leading-[1.3] tracking-tight text-gray-900">
                    16 areas of critical clean energy innovation.
                </h2>
                <p className="text-[15px] leading-[1.75] text-gray-500">
                    EPIC supports a wide range of clean energy research, development, and demonstration.  Investment plans from EPIC 1-4 have invested in the following key Investment Areas.
                </p>
            </div>

            {/* Themed groups */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                {groups.map((group) => (
                    <div key={group.theme}>
                        {/* Group header with colored accent */}
                        <div className="mb-4 flex items-center gap-2.5">
                            <span
                                aria-hidden
                                className="h-3 w-[3px] rounded-full"
                                style={{ background: group.color }}
                            />
                            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-gray-700">
                                {group.theme}
                            </h3>
                        </div>

                        <ul className="space-y-2 border-l border-gray-100 pl-4">
                            {group.areas.map((area) => (
                                <li
                                    key={area}
                                    className="text-[14px] leading-[1.5] text-gray-600"
                                >
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}