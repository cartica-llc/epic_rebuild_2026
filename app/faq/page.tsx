import FAQAccordion from "@/components/faq/FAQAccordion";
import Image from "next/image";
import React from "react";

export const metadata = {
    title: "FAQ — EPIC Database",
    description:
        "Frequently asked questions about the Electric Program Investment Charge (EPIC) and the EPIC Database.",
};

export default function FAQPage() {
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
                        EPIC Database <span className="text-slate-300 mx-1">/</span> FAQ
                    </p>
                </div>
            </header>
            <main className=" max-w-[1600px] mx-auto pb-12 px-8">

                <FAQAccordion />

            </main>
        </>

    );
}