"use client";

import React from "react";

import Hero from "@/components/about/Hero";
import UpdateAccordion from "@/components/about/Updateaccordion";
import MissionStatement from "@/components/about/MissionStatement";
import Epic5Card from "@/components/about/Epic5Card";
import InvestmentAreas from "@/components/about/InvestmentAreas";
import FundingNote from "@/components/about/FundingNote";

export default function AboutPage() {
    return (
        <main className="font-sans text-gray-900 antialiased">
            <Hero />
            <UpdateAccordion />

            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                <div className="space-y-24 py-16 lg:py-20">
                    <MissionStatement delay={0.1} />
                    <Epic5Card delay={0.14} />
                    <InvestmentAreas delay={0.18} />
                    <FundingNote delay={0.22} />
                </div>
            </div>
        </main>
    );
}