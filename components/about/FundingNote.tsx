"use client";

import React from "react";
import { motion } from "motion/react";

interface FundingNoteProps {
    delay?: number;
}

export default function FundingNote({ delay = 0 }: FundingNoteProps) {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
        >

            <div
                aria-hidden
                className="mb-6 h-px w-full"
                style={{
                    background:
                        "linear-gradient(to right, transparent 0%, #0284c7 15%, #059669 50%, #e11d48 85%, transparent 100%)",
                    opacity: 0.12,
                }}
            />

            <div className="flex items-start gap-3">
                <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                </svg>
                <p className="text-[13px] leading-[1.7] text-gray-400">
                    This program is funded by California utility customers under the
                    auspices of the California Public Utilities Commission.
                </p>
            </div>
        </motion.footer>
    );
}