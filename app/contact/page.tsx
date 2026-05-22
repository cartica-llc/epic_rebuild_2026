"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

const brandGradientBorder: React.CSSProperties = {
    background:
        "linear-gradient(to right, rgb(2, 132, 199), rgb(5, 150, 105), rgb(225, 29, 72)) border-box",
    border: "2px solid transparent",
    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px)",
};

export default function ContactPage() {
    return (

        <>
            <header className="px-8 py-6">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <Image
                        src="/logo/CAgov-logo.svg"
                        alt="California Government Logo"
                        width={32}
                        height={32}
                        className="h-8 w-auto object-contain"
                        priority
                    />
                    <div className="h-4 w-px bg-slate-200" />
                    <p className="text-sm font-medium text-slate-500">
                        EPIC Database <span className="text-slate-300 mx-1">/</span> Contact us
                    </p>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-8 py-16 font-sans text-gray-900">

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="mb-3 text-4xl font-semibold tracking-tight">Contact</h1>
                        <p className="text-base leading-relaxed text-gray-500">
                            Reach out to the Policy + Innovation Coordination Group Project Coordinator with any questions or inquiries about the EPIC program.
                        </p>
                    </motion.div>

                    {/* Right — contact card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.1 }}
                        className="relative rounded-xl bg-gray-50/50 shadow-sm"
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-xl" style={brandGradientBorder} />
                        <div className="relative z-10 p-7">
                            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <p className="mb-1 text-sm font-semibold text-gray-900">The Accelerate Group</p>
                            <p className="mb-5 text-sm leading-relaxed text-gray-600">
                                You can reach the Policy + Innovation Coordination Group Project Coordinator at:
                            </p>
                            <a
                                href="mailto:picg@theaccelerategroup.com"
                                className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                Send an email
                            </a>
                            <p className="mt-4 text-sm font-mono text-gray-400">PICG@theaccelerategroup.com</p>
                        </div>
                    </motion.div>
                </div>
            </main>
        </>

    );
}