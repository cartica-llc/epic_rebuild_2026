"use client";

import React from "react";
import { motion } from "motion/react";

interface MissionStatementProps {
    delay?: number;
}

export default function MissionStatement({ delay = 0 }: MissionStatementProps) {
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
                        background: "linear-gradient(135deg, #0284c7, #059669)",
                    }}
                />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">
                    About the program
                </span>
                <span className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-5">
                    <h2 className="text-[1.625rem] font-semibold leading-[1.3] tracking-tight text-gray-900">
                        A California ratepayer-funded program investing in the
                        state&rsquo;s clean energy future.
                    </h2>
                </div>

                <div className="space-y-5 lg:col-span-6 lg:col-start-7">
                    <p className="text-[15px] leading-[1.8] text-gray-600">
                        The Electric Program Investment Charge drives efficient,
                        coordinated investment in new and emerging clean energy
                        solutions. It supports research, development, and demonstration
                        across California&rsquo;s energy system — from grid
                        modernization and decarbonization to resilience and emerging
                        technologies.
                    </p>
                </div>
            </div>

            <div className="relative mt-12 rounded-lg bg-gray-50 py-8 pl-8 pr-8 lg:pl-10">

                <div
                    aria-hidden
                    className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                    style={{
                        background:
                            "linear-gradient(to bottom, #0284c7, #059669)",
                    }}
                />

                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sky-600 mb-3">
                    Guiding Principle
                </p>
                <p className="max-w-3xl text-lg font-medium leading-[1.6] text-gray-800 lg:text-xl lg:leading-[1.65]">
                    To provide ratepayer benefits through investment in innovation
                    that ensures equitable access to safe, affordable, reliable, and
                    environmentally sustainable energy.
                </p>
            </div>
        </motion.section>
    );
}