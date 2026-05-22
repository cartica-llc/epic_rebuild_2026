"use client";

import React from "react";
import { motion } from "motion/react";

const defaultAreas = [
    "Building decarbonization",
    "Cybersecurity",
    "Demand reduction",
    "Distributed energy resource integration",
    "Energy storage",
    "Entrepreneurial ecosystems",
    "Grid decarbonization",
    "Grid decentralization",
    "Grid modernization",
    "Grid optimization",
    "Grid resiliency and safety",
    "High penetration renewable energy integration",
    "Industrial and agricultural innovation",
    "Smart grid technology",
    "Transportation electrification",
    "Wildfire mitigation",
];

interface InvestmentAreasProps {
    areas?: string[];
    delay?: number;
    scrollDuration?: number;
}

export default function InvestmentAreas({
                                            areas = defaultAreas,
                                            delay = 0,
                                            scrollDuration = 26,
                                        }: InvestmentAreasProps) {

    const loop = [...areas, ...areas];

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <div className="mb-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Investment Areas
                    </h3>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900 leading-snug">
                        Where EPIC invests in critical innovation.
                    </h2>
                </div>
                <div>
                    <p className="text-base leading-relaxed text-gray-600">
                        EPIC supports a wide range of clean energy research, development, and demonstration — spanning grid modernization, decarbonization, resilience, and emerging technologies.
                    </p>
                </div>
            </div>

            {/* End-credits scroller — items float up one by one and exit off the top */}
            <div
                className="group relative mx-auto h-96 max-w-md overflow-hidden"
                style={{
                    maskImage:
                        "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
                }}
            >
                <motion.div
                    animate={{ y: ["0%", "-50%"] }}
                    transition={{ duration: scrollDuration, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 top-0 [animation-play-state:running] group-hover:[&]:[animation-play-state:paused]"
                >
                    {loop.map((area, i) => (
                        <div
                            key={`${area}-${i}`}
                            className="mb-3 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4"
                        >
                            <span className="shrink-0 text-[10px] font-mono text-gray-400">
                                {String((i % areas.length) + 1).padStart(2, "0")}
                            </span>
                            <p className="text-sm font-medium text-gray-700">{area}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </motion.section>
    );
}