// app/docs/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { HowToSection } from '@/components/docs/HowToSection';
import { ComplianceSection } from '@/components/docs/ComplianceSection';
import { ResourcesSection } from '@/components/docs/ResourcesSection';
// import { BRAND_GRADIENT } from '@/components/docs/brand';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Top brand bar */}
            {/*<div className="h-0.5 w-full" style={{ background: BRAND_GRADIENT }} />*/}

            {/* Header */}
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
                        EPIC Database <span className="text-slate-300 mx-1">/</span> Documentation & Resources
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-8">
                {/* Page title */}
                {/*<div className="mb-16">*/}
                {/*    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Documentation</h1>*/}
                {/*    <p className="mt-2 text-base text-slate-400">*/}
                {/*        Platform guides, compliance requirements, and program resources.*/}
                {/*    </p>*/}
                {/*</div>*/}

                {/* Sections — separated by thin rules */}
                <div className="divide-y divide-slate-100">
                    <ResourcesSection />
                    <ComplianceSection />
                    <HowToSection />
                </div>
            </div>
        </div>
    );
}