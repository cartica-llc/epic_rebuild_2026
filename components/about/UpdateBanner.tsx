"use client";

import React from "react";
import { motion } from "motion/react";
import { brandGradientBorder } from "./brandGradient";

interface UpdateBannerProps {
    date?: string;
    headline?: string;
    body?: React.ReactNode;
    delay?: number;
}

export default function UpdateBanner({
    date = "February 26, 2026",
    headline = "CPUC adopts 13 Strategic Objectives for EPIC 5",
    body,
    delay = 0,
}: UpdateBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative rounded-xl bg-gray-50/50 shadow-sm"
        >
            <div className="pointer-events-none absolute inset-0 rounded-xl" style={brandGradientBorder} />
            <div className="relative z-10 p-7">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-3 py-1 text-xs font-mono text-gray-500 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Update · {date}
                </div>
                <h2 className="mb-2 text-lg font-semibold tracking-tight text-gray-900">
                    {headline}
                </h2>
                <p className="text-sm leading-relaxed text-gray-600">
                    {body ?? (
                        <>
                            The CPUC adopted a set of 13 Strategic Objectives to guide investments in the EPIC 5 investment period (2026–2030). Strategic Objectives are clear, measurable, and robust targets to guide EPIC investment plan strategies to scale and deploy innovation to align with EPIC's Strategic Goals (adopted on March 7, 2024).
                        </>
                    )}
                </p>
            </div>
        </motion.div>
    );
}
