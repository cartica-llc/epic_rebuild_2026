"use client";

import React from "react";

import Hero from "@/components/about/Hero";
import MissionStatement from "@/components/about/MissionStatement";
import Epic5Card from "@/components/about/Epic5Card";
import InvestmentAreas from "@/components/about/InvestmentAreas";
import FundingNote from "@/components/about/FundingNote";
import UpdateAccordion from "@/components/about/Updateaccordion";

export default function AboutPage() {
    return (
        <main className="font-sans text-gray-900">

            <Hero />
            <div className=" mx-auto">

                <UpdateAccordion />
            </div>
            <div className="max-w-6xl mx-auto px-6 py-10">


                <div className="max-w-5xl mx-auto space-y-16">
                    <MissionStatement delay={0.1} />
                    <Epic5Card delay={0.15} />
                    <InvestmentAreas delay={0.2} />
                    <FundingNote delay={0.3} />
                </div>
            </div>
        </main>
    );
}
