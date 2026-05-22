"use client";

import React from "react";
import { motion } from "motion/react";

interface MissionStatementProps {
    delay?: number;
}

export default function MissionStatement({ delay = 0 }: MissionStatementProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16"
        >
            <div>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    About EPIC
                </h3>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 leading-snug">
                    Driving efficient, coordinated investment in new and emerging clean energy solutions for California.
                </h2>
            </div>

            <div className="space-y-4 text-base leading-relaxed text-gray-600">
                <p>
                    EPIC is a California ratepayer-funded program that drives efficient, coordinated investment in new and emerging clean energy solutions.
                </p>
                <p>
                    Its mandatory guiding principle is to provide ratepayer benefits, with a mission of investment in innovation to ensure equitable access to safe, affordable, reliable, and environmentally sustainable energy for electricity ratepayers.
                </p>
            </div>
        </motion.section>
    );
}
