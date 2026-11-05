"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const EMAIL = "picg@theaccelerategroup.com";
const BRAND = "linear-gradient(to right, #0284c7, #059669, #e11d48)";
const ease = "easeOut" as const;

function ContactHero() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

    return (
        <section
            ref={sectionRef}
            className="relative h-[25dvh] min-h-[200px] select-none overflow-hidden"
        >
            <motion.div style={{ y: imgY }} className="absolute inset-0 z-[1]">
                <motion.img
                    src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
                    alt=""
                    initial={{ scale: 1.0 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 22, ease }}
                    className="h-[140%] w-full object-cover opacity-70 !blur-[3px]"
                />
            </motion.div>

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
                    transition={{ duration: 0.7, delay: 0.15, ease }}
                    className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-sky-600"
                >
                    Policy + Innovation Coordination Group
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.3, ease }}
                    className="mb-2 max-w-2xl text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl lg:leading-[1.1]"
                >
                    Contact{" "}
                    <span className="bg-clip-text text-transparent" style={{ backgroundImage: BRAND }}>
                        Us
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.7, delay: 0.5, ease }}
                    className="max-w-md text-sm leading-relaxed text-gray-600 sm:max-w-lg sm:text-base sm:leading-relaxed"
                >
                    Questions or inquiries about the EPIC program can be directed to the
                    PICG Project Coordinator.
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

function SectionLabel({ children, dot = "bg-sky-600" }: { children: React.ReactNode; dot?: string }) {
    return (
        <div className="mb-10 flex items-center gap-3">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">{children}</p>
            <span className="h-px flex-1 bg-gray-100" />
        </div>
    );
}

const fadeIn = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, ease },
};

function CopyButton() {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(EMAIL);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                } catch {
                }
            }}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            aria-live="polite"
        >
            {copied ? "Copied" : "Copy address"}
        </button>
    );
}

const INCLUDE = [
    "Your name, organization, and role",
    "The EPIC project number, if your question concerns a specific project",
    "The program administrator involved (CEC, PG&E, SCE, or SDG&E), if known",
    "A short description of your question or request",
];

const RESOURCES = [
    { title: "About EPIC", body: "Program purpose, guiding principle, and the current investment cycle.", href: "/about" },
    { title: "Projects", body: "Search active and completed EPIC projects across all administrators.", href: "/projects" },
];

export default function ContactPage() {
    return (
        <>
            <ContactHero />

            <main className="mx-auto max-w-5xl px-6 pb-24 pt-14 font-sans text-gray-900 lg:px-8">
                <section>
                    <SectionLabel>Contact information</SectionLabel>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        <motion.h2
                            {...fadeIn}
                            className="max-w-md text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
                        >
                            Reach the PICG Project Coordinator by email.
                        </motion.h2>

                        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
                            <dl className="divide-y divide-gray-100 border-y border-gray-100">
                                <div className="grid grid-cols-3 gap-4 py-4">
                                    <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">Office</dt>
                                    <dd className="col-span-2 text-[15px] text-gray-900">
                                        Policy + Innovation Coordination Group
                                    </dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4 py-4">
                                    <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">Coordinator</dt>
                                    <dd className="col-span-2 text-[15px] text-gray-900">The Accelerate Group</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4 py-4">
                                    <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">Email</dt>
                                    <dd className="col-span-2">
                                        <a
                                            href={`mailto:${EMAIL}`}
                                            className="break-all text-[15px] font-medium text-sky-700 underline decoration-sky-200 underline-offset-4 transition-colors hover:decoration-sky-700"
                                        >
                                            {EMAIL}
                                        </a>
                                    </dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4 py-4">
                                    <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">Program</dt>
                                    <dd className="col-span-2 text-[15px] text-gray-900">
                                        Electric Program Investment Charge (EPIC)
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <a
                                    href={`mailto:${EMAIL}`}
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    Send an email
                                </a>
                                <CopyButton />
                            </div>
                        </motion.div>
                    </div>
                </section>

                <motion.section
                    {...fadeIn}
                    className="relative mt-16 rounded-xl bg-gray-50/80 px-8 py-8 sm:px-10"
                >
                    <span aria-hidden className="absolute bottom-5 left-0 top-5 w-[3px] rounded-full" style={{ background: "linear-gradient(to bottom, #0284c7, #059669)" }} />
                    <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-sky-600">
                        Before you write
                    </p>
                    <p className="mb-5 max-w-2xl text-lg leading-relaxed text-gray-800">
                        To help us route your message, please include:
                    </p>
                    <ul className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
                        {INCLUDE.map((item) => (
                            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-gray-600">
                                <svg className="mt-1 h-4 w-4 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                {item}
                            </li>
                        ))}
                    </ul>
                </motion.section>

                <section className="mt-20">
                    <SectionLabel dot="bg-rose-600">Related resources</SectionLabel>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {RESOURCES.map((r, i) => (
                            <motion.a
                                key={r.title}
                                href={r.href}
                                {...fadeIn}
                                transition={{ ...fadeIn.transition, delay: i * 0.08 }}
                                className="group flex items-start justify-between gap-6 rounded-xl border border-gray-100 bg-white p-6 transition-colors hover:border-gray-200 hover:bg-gray-50/60"
                            >
                                <div>
                                    <p className="text-base font-semibold text-gray-900">{r.title}</p>
                                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{r.body}</p>
                                </div>
                                <svg className="mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </motion.a>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}