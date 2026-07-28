"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
// import Image from "next/image";

import { faqItems, faqCategories, type FAQCategory, type FAQItem } from "./faqData";

const brandGradientBorder: React.CSSProperties = {
    background: "linear-gradient(to right, rgb(2, 132, 199), rgb(5, 150, 105), rgb(225, 29, 72)) border-box",
    border: "2px solid transparent",
    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    opacity: 1,
    clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px)",
};

export default function FAQPage() {
    const [openId, setOpenId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<FAQCategory>("program");

    const filtered = faqItems.filter(
        (item) => activeCategory === "all" || item.category === activeCategory
    );

    const toggle = (id: string) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <main className="max-w-7xl mx-auto relative font-sans text-gray-900">
            <section className="mx-auto">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
                    <div className="flex flex-col lg:col-span-4 xl:col-span-4">
                        <motion.div
                            className="mb-12 flex flex-col items-start"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="mb-8 inline-flex items-center gap-3">
                                {/*<Image*/}
                                {/*    src="/logo/cpuc-logo.png"*/}
                                {/*    alt="California Government Logo"*/}
                                {/*    width={48}*/}
                                {/*    height={48}*/}
                                {/*    className="h-12 w-auto object-contain"*/}
                                {/*    priority*/}
                                {/*/>*/}
                            </div>

                            <h1 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                                Help Center
                            </h1>
                            <p className="text-base leading-relaxed text-gray-500">
                                Everything you need to know about the EPIC program, platform features, funding opportunities, and database access.
                            </p>
                        </motion.div>

                        <motion.div
                            className=""
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Filter by Topic
                            </h3>
                            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-1.5">
                                {faqCategories.map((cat) => {
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setActiveCategory(cat.id as FAQCategory);
                                                setOpenId(null);
                                            }}
                                            className={`relative w-full rounded-md px-4 py-3 text-left text-sm font-medium transition-colors ${
                                                isActive ? "text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeFilterBg"
                                                    className="absolute inset-0 rounded-md bg-gray-100/80 shadow-sm border border-gray-200/60"
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                            <span className="relative z-10">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-12 hidden"
                        >
                            <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Helpful Resources
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <Link href="/docs/user-guide" className="group flex items-center text-sm font-medium text-gray-600 hover:text-blue-600">
                                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Platform User Guide
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/api-docs" className="group flex items-center text-sm font-medium text-gray-600 hover:text-blue-600">
                                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        API Documentation
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/events" className="group flex items-center text-sm font-medium text-gray-600 hover:text-blue-600">
                                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Upcoming Workshops
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 hidden flex-col items-start justify-center rounded-xl border border-gray-100 bg-gray-50/80 p-7 lg:flex"
                        >
                            <p className="mb-2 text-base font-semibold text-gray-900">Still have questions?</p>
                            <p className="mb-6 text-sm leading-relaxed text-gray-500">Our support team is ready to help you with the database, funding applications, or general inquiries.</p>
                            <Link
                                href="/contact"
                                className="w-full rounded-md bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
                            >
                                Contact Support
                            </Link>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-6 lg:col-start-7 xl:col-span-6 xl:col-start-7">
                        <motion.div layout className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filtered.length > 0 ? (
                                    filtered.map((item: FAQItem, index: number) => {
                                        const isOpen = openId === item.id;

                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                                                transition={{ duration: 0.25, delay: index * 0.04 }}
                                                className={`group relative rounded-xl transition-colors ${
                                                    isOpen ? "bg-gray-50/50 shadow-sm" : "border border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30"
                                                }`}
                                            >
                                                {isOpen && (
                                                    <div
                                                        className="pointer-events-none absolute inset-0 rounded-xl"
                                                        style={brandGradientBorder}
                                                    />
                                                )}

                                                <button
                                                    onClick={() => toggle(item.id)}
                                                    className="relative z-10 flex w-full items-start gap-4 p-6 md:p-7 text-left outline-none"
                                                >
                                                    <span className="mt-0.5 text-sm font-mono text-gray-400">
                                                        {String(index + 1).padStart(2, "0")}
                                                    </span>

                                                    <span className={`flex-1 text-base font-medium transition-colors ${isOpen ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"}`}>
                                                        {item.question}
                                                    </span>

                                                    <motion.div
                                                        animate={{ rotate: isOpen ? 45 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${isOpen ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}`}
                                                    >
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </motion.div>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                            className="relative z-10 overflow-hidden"
                                                        >
                                                            <div className="pb-7 pl-[3.5rem] pr-7 pt-0 md:pl-16">
                                                                <p className="text-base leading-relaxed text-gray-600">
                                                                    {item.answer}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="rounded-xl border border-dashed border-gray-200 py-20 text-center"
                                    >
                                        <p className="text-base text-gray-500">No questions found in this category.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 flex flex-col items-start justify-center rounded-xl border border-gray-100 bg-gray-50/80 p-7 lg:hidden"
                        >
                            <p className="mb-2 text-base font-semibold text-gray-900">Still have questions?</p>
                            <p className="mb-6 text-sm leading-relaxed text-gray-500">Our support team is ready to help you with the database, funding applications, or general inquiries.</p>
                            <Link
                                href="/contact"
                                className="w-full rounded-md bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
                            >
                                Contact Support
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    );
}