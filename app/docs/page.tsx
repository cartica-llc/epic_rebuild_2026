// app/docs/page.tsx
'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { HowToSection } from '@/components/docs/HowToSection';
import { ComplianceSection } from '@/components/docs/ComplianceSection';
import { ResourcesSection } from '@/components/docs/ResourcesSection';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Header */}
            <header className="px-8 py-6">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <Image
                        src="/logo/cpuc-logo.png"
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
                <div className="divide-y divide-slate-100">
                    <ResourcesSection />
                    <ComplianceSection />
                    {/* Suspense required by Next.js App Router for useSearchParams() */}
                    <Suspense fallback={null}>
                        <HowToSection />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}