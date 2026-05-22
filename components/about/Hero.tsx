"use client";

import React from "react";
import { motion } from "motion/react";

import FloatingIcons from "./FloatingIcons";

export default function Hero() {
    return (
        <section className="select-none relative overflow-hidden rounded-t-3xl border border-gray-100 bg-white">
            {/* Animated gradient blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    aria-hidden
                    initial={{ x: -100, y: -100 }}
                    animate={{ x: [-100, 40, -80, -100], y: [-100, 30, -60, -100] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-sky-400/30 blur-[120px]"
                />
                <motion.div
                    aria-hidden
                    initial={{ x: 100, y: 50 }}
                    animate={{ x: [100, -40, 80, 100], y: [50, 120, 20, 50] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 right-0 h-[26rem] w-[26rem] rounded-full bg-emerald-400/25 blur-[120px]"
                />
                <motion.div
                    aria-hidden
                    initial={{ x: 0, y: 100 }}
                    animate={{ x: [0, 80, -40, 0], y: [100, 60, 140, 100] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-32 left-1/3 h-[24rem] w-[24rem] rounded-full bg-rose-400/25 blur-[120px]"
                />
            </div>

            {/* Subtle grid overlay */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgb(15 23 42) 1px, transparent 1px), linear-gradient(to right, rgb(15 23 42) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Floating energy icons — rise one by one on opposite sides */}
            <FloatingIcons />

            {/* Centered title */}
            <div className="relative z-10 flex flex-col items-center px-8 py-28 text-center lg:py-40">
                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/70 px-3 py-1 text-xs font-mono uppercase tracking-wider text-gray-500 backdrop-blur-sm"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Electric Program Investment Charge
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="text-5xl font-semibold tracking-tight text-gray-900 lg:text-7xl"
                >
                    About{" "}
                    <span className="bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600 bg-clip-text text-transparent">
                        EPIC
                    </span>
                </motion.h1>
            </div>
        </section>
    );
}