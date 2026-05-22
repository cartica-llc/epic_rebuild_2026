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
        id: "personal-information",
        title: "Personal Information and Choice",
        body: `"Personal information" identifies or describes an individual, including name, social security number, physical description, home address, telephone number, education, financial matters, and medical or employment history. A domain name or IP address is not personal information but is considered "electronically collected personal information."

Electronically collected personal information we automatically collect includes your IP address and statistical data about which pages you visit. If you voluntarily participate in activities requiring specific information — such as completing a request for assistance, sending an e-mail, or participating in a survey — more detailed data will be collected. Choosing not to participate does not affect your ability to use any other feature of the site.`,
    },
    {
        id: "children",
        title: "A Special Note about Children",
        body: "Children are not eligible to use services that require submission of personal information. We require that minors (under 18) do not submit personal information to us. If you are a minor, these services may only be used together with a parent or guardian.",
    },
    {
        id: "collected-information",
        title: "Information Collected and How it is Used",
        body: "We collect personal information directly from individuals who voluntarily use certain services. Automatically collected data is used to improve web content and understand how visitors use our services — it does not identify you personally. The Accelerate Group does not sell any electronically collected personal information. Any distribution is solely for the purposes for which it was provided.",
    },
    {
        id: "submitted-information",
        title: "What Happens to Information You Submit",
        body: "Information submitted to us is transmitted through secure lines to our database. Private information is used only for the purposes for which it was provided and is not shared with another entity except as prescribed by law. See our Privacy Policy for additional information.",
    },
    {
        id: "surveys",
        title: "Surveys & E-mail",
        body: "If you participate in a survey or send an e-mail, we collect the e-mail address, contents of the e-mail, and information volunteered in response to the survey. This information is retained in accordance with Government Code § 11015.5. E-mail may be forwarded to State employees better able to assist you, and is not shared with other organizations except as required by law or for authorized law enforcement investigations.",
    },
    {
        id: "public-disclosure",
        title: "Public Disclosure",
        body: "California law ensures public access to appropriate government records. All information collected at this site may become public record upon transfer to the California Public Utilities Commission at the conclusion of The Accelerate Group's contract, and may be subject to public inspection unless an exemption in law exists. In the event of a conflict between this Use Policy and the Public Records Act or other applicable law, that law will control.",
    },
    {
        id: "cookies",
        title: "Automatic Collection / Cookies",
        body: "When you visit our site, a temporary cookie may be created linking your computer to the site. Temporary cookies may be used to complete a transaction, process submitted data, or facilitate ongoing interaction. Cookies do not compromise your privacy or security. You can refuse or delete cookies using your browser settings.",
    },
    {
        id: "security",
        title: "Security",
        body: "The Accelerate Group has taken steps to safeguard its telecommunications and computing infrastructure, including authentication, monitoring, auditing, and encryption. Security measures are integrated into the design and day-to-day practices of the operating environment. This information should not be construed as giving business or legal advice, or as warranting the fail-proof security of information provided via this site.",
    },
    {
        id: "links",
        title: "Links to Other Sites",
        body: "This site links to external sites that may provide useful services. When you link to another site, you are no longer on our site and are subject to that site's privacy policy. The Accelerate Group accepts no responsibility for the content or accessibility of external websites or documents linked from this site.",
    },
    {
        id: "liability",
        title: "Limitation of Liability",
        body: "The Accelerate Group makes no claims, promises, or guarantees about the accuracy, completeness, or adequacy of the contents of this site and expressly disclaims liability for errors and omissions. No warranty of any kind — implied, expressed, or statutory — is given with respect to the contents of this site or its hyperlinks. References to commercial products or services do not constitute endorsement by The Accelerate Group or the State of California.",
    },
    {
        id: "ownership",
        title: "Ownership",
        body: "Information presented on this site, unless otherwise indicated, is considered in the public domain and may be distributed or copied as permitted by law. The Accelerate Group does make use of copyrighted data (e.g., photographs) which may require additional permissions. The Accelerate Group shall have the unlimited right to use, free of charge, all information submitted via this site except those submissions made under separate legal contract.",
    },
];

export default function ConditionsOfUsePage() {
    return (
        <main className="max-w-5xl mx-auto px-6 py-16 font-sans text-gray-900">
            {/* Header */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="mb-2 text-4xl font-semibold tracking-tight">Conditions of Use</h1>
                    <p className="text-sm font-mono text-gray-400">Effective 07/28/2020</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08 }}
                >
                    <p className="text-base leading-relaxed text-gray-500">
                        By visiting this web site, you are accepting the policies and practices described in this notice. The Accelerate Group also maintains a Privacy Policy, available on this site.
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
                        transition={{ duration: 0.25, delay: 0.1 + i * 0.04 }}
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
                                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{section.body}</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-sm leading-relaxed text-gray-600">
                    This Use Policy is subject to change without notice and reflects The Accelerate Group's current business practices. For questions, contact us at{" "}
                    <a href="mailto:picg@theaccelerategroup.com" className="font-medium text-sky-600 hover:text-sky-700 transition-colors">
                        PICG@theaccelerategroup.com
                    </a>
                </p>
            </motion.div>
        </main>
    );
}