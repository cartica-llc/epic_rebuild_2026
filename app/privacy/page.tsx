"use client";

import React from "react";
import { motion } from "motion/react";

const brandGradientBorder: React.CSSProperties = {
    background:
        "linear-gradient(to right, rgb(2, 132, 199), rgb(5, 150, 105), rgb(225, 29, 72)) border-box",
    border: "2px solid transparent",
    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px)",
};

const sections = [
    {
        id: "collection",
        title: "Collection of Personal Information",
        body: "The Accelerate Group collects personal information only as allowed by law, limited to what is relevant and necessary for the PICG effort. Personal information includes name, Social Security number, home address, telephone number, education, financial matters, and medical or employment history as defined by the California Information Practices Act.",
    },
    {
        id: "browsing",
        title: "Browsing Our Website",
        body: "We do not collect addresses or account information from visitors who simply browse the site. Information automatically collected includes IP address, browser and OS type, visit date and time, and pages viewed. This information is exempt from Public Records Act requests.",
    },
    {
        id: "cookies",
        title: "Use of Cookies",
        body: "Session cookies may be used in limited areas to improve usability, such as online forms. These cookies do not collect personal information, do not track return visits, and are deleted when you close your browser. You may disable cookies in your browser preferences.",
    },
    {
        id: "purpose",
        title: "Purpose of Collection",
        body: "We inform individuals of the purpose for collecting their personal information at the time of collection, as well as the general uses that will be made of that information.",
    },
    {
        id: "use",
        title: "Use of Personal Information",
        body: "Personal information is used only for the purposes stated at collection, or consistent with those purposes, unless we obtain consent from the individual or are authorized by law or regulation.",
    },
    {
        id: "security",
        title: "Information Security",
        body: "We take reasonable precautions to protect personal information against loss, unauthorized access, modification, or disclosure — including encryption during transmission, secure storage, staff training, and access controls limited to staff whose work requires it.",
    },
];

export default function PrivacyPolicyPage() {
    return (
        <main className="max-w-5xl mx-auto px-6 py-16 font-sans text-gray-900">
            {/* Header row */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="mb-2 text-4xl font-semibold tracking-tight">Privacy Policy</h1>
                    <p className="text-sm font-mono text-gray-400">Effective 07/28/2020</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08 }}
                >
                    <p className="text-base leading-relaxed text-gray-500">
                        The Accelerate Group is committed to protecting the privacy rights of individuals in its role as PICG Project Coordinator. This policy governs personal information collected or maintained on this website.
                    </p>
                </motion.div>
            </div>

            <div className="h-px bg-gray-100 mb-10" />

            {/* Sections — 2 col grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {sections.map((section, i) => (
                    <motion.div
                        key={section.id}
                        id={section.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.1 + i * 0.05 }}
                        className="group relative rounded-xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:bg-gray-50/30 transition-colors"
                    >
                        <div
                            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={brandGradientBorder}
                        />
                        <div className="flex items-start gap-4">
                            <span className="shrink-0 text-xs font-mono text-gray-400 pt-0.5">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                                <h2 className="mb-2 text-sm font-semibold text-gray-900">{section.title}</h2>
                                <p className="text-sm leading-relaxed text-gray-600">{section.body}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 rounded-xl border border-gray-100 bg-gray-50/80 p-6 flex items-start gap-3"
            >
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="text-sm leading-relaxed text-gray-600">
                    This policy is effective July 28, 2020. For questions or complaints, contact us at{" "}
                    <a href="mailto:picg@theaccelerategroup.com" className="font-medium text-sky-600 hover:text-sky-700 transition-colors">
                        PICG@theaccelerategroup.com
                    </a>
                </p>
            </motion.div>
        </main>
    );
}