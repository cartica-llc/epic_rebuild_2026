"use client";

import React from "react";
import { motion } from "motion/react";

interface FundingNoteProps {
    delay?: number;
}

export default function FundingNote({ delay = 0 }: FundingNoteProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
            className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-6"
        >
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-sm leading-relaxed text-gray-600">
                This program is funded by California utility customers under the auspices of the California Public Utilities Commission.
            </p>
        </motion.div>
    );
}
