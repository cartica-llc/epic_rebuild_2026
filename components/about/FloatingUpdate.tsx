"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { brandGradientBorder } from "./brandGradient";

interface FloatingUpdateProps {
    date?: string;
    shortDate?: string;
    headline?: string;
    decisionRef?: string;
}

export default function FloatingUpdate({
                                           date = "February 26, 2026",
                                           shortDate = "Feb 26, 2026",
                                           headline = "CPUC adopts 13 Strategic Objectives for EPIC 5",
                                           decisionRef = "CPUC Decision · D.26-02-037",
                                       }: FloatingUpdateProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="absolute right-6 top-6 z-20 max-w-[calc(100%-3rem)] lg:right-12 lg:top-12 lg:max-w-xs">
            {/* The pill itself — floats gently */}
            <motion.div
                animate={{ y: [0, -6, 0], rotate: [-1, 1.2, -1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
            >
                <motion.button
                    onClick={() => setOpen((o) => !o)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    aria-expanded={open}
                    aria-label="Toggle update details"
                    className="relative flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-lg shadow-gray-900/10 border border-gray-100 cursor-pointer"
                >
                    {/* Pondering emoji inside a soft gradient circle */}
                    <motion.span
                        animate={{ rotate: [-10, 10, -10] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-50 via-emerald-50 to-rose-50 text-lg select-none"
                    >
                        🤔
                    </motion.span>

                    <div className="text-left">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400 leading-tight">
                            Update
                        </p>
                        <p className="text-xs font-semibold text-gray-800 leading-tight whitespace-nowrap">
                            {shortDate}
                        </p>
                    </div>

                    <motion.svg
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="ml-0.5 h-3.5 w-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </motion.svg>

                    {/* Pulsing notification dot */}
                    {!open && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500 border-2 border-white" />
                        </span>
                    )}
                </motion.button>
            </motion.div>

            {/* Expanded detail card */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="relative mt-3 rounded-2xl bg-white shadow-xl shadow-gray-900/10"
                    >
                        <div
                            className="pointer-events-none absolute inset-0 rounded-2xl"
                            style={brandGradientBorder}
                        />
                        <div className="relative z-10 p-5">
                            <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-gray-400">
                                {decisionRef}
                            </p>
                            <h3 className="mb-1 text-sm font-semibold text-gray-900 leading-snug">
                                {headline}
                            </h3>
                            <p className="text-[11px] font-mono text-gray-400">
                                Adopted {date}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}