"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

    return (
        <section
            ref={sectionRef}
            className="select-none relative h-[25dvh] min-h-[200px] overflow-hidden "
        >

            <div
                aria-hidden
                className="relative z-20 h-0.5 w-full"

            />

            <div
                aria-hidden
                className="absolute inset-0 z-0"

            />

            {/* Grayscale image — Ken Burns + parallax */}
            <motion.div style={{ y: imgY }} className="absolute inset-0 z-[1]">
                <motion.img
                    src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
                    alt=""
                    initial={{ scale: 1.0 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 22, ease: "easeOut" }}
                    className="h-[140%] w-full object-cover opacity-70"
                    style={{ }}
                />
            </motion.div>

            {/* Brand gradient color layer — multiplied onto the grayscale */}
            <div
                aria-hidden
                className="absolute inset-0 z-[2]  opacity-50"

            />

            <div
                aria-hidden
                className="absolute inset-0 z-[3]"
                style={{
                    background:
                        "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0) 85%)",
                }}
            />

            <div
                aria-hidden
                className="absolute inset-0 z-[4] opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                }}
            />

            <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-5xl px-6 pb-5 lg:px-8 lg:pb-8">
                <motion.p
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                    className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-sky-600"
                >
                    Electric Program Investment Charge
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="mb-2 max-w-2xl text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl lg:leading-[1.1]"
                >
                    About{" "}
                    <span
                        className="bg-clip-text text-transparent"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, #0284c7, #059669, #e11d48)",
                        }}
                    >
                        EPIC
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                    className="max-w-md text-sm leading-relaxed text-gray-600 sm:max-w-lg sm:text-base sm:leading-relaxed"
                >
                    Driving efficient, coordinated investment in new and emerging
                    clean energy solutions for California&rsquo;s electricity
                    ratepayers.
                </motion.p>
            </div>


            <div
                aria-hidden
                className="absolute bottom-0 left-0 right-0 z-[11] h-px"
                style={{
                    background:
                        "linear-gradient(to right, transparent 0%, #0284c7 20%, #059669 50%, #e11d48 80%, transparent 100%)",
                    opacity: 0.2,
                }}
            />
        </section>
    );
}