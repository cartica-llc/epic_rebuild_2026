// components/docs/DocsNav.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, HelpCircle, Link2, ShieldCheck } from 'lucide-react';
import { BRAND_GRADIENT } from './brand';

export type DocSection = 'howto' | 'compliance' | 'resources';

interface NavItem {
    id: DocSection;
    label: string;
    sub: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    {
        id: 'howto',
        label: 'How-To Guides',
        sub: 'Step-by-step walkthroughs',
        icon: <BookOpen className="h-4 w-4" />,
    },
    {
        id: 'compliance',
        label: 'Compliance Logic',
        sub: 'Field rules & stage requirements',
        icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
        id: 'resources',
        label: 'Resources & Partners',
        sub: 'External links & references',
        icon: <Link2 className="h-4 w-4" />,
    },
];

interface DocsNavProps {
    active: DocSection;
    onChange: (s: DocSection) => void;
}

export function DocsNav({ active, onChange }: DocsNavProps) {
    return (
        <aside className="flex flex-col gap-6">
            {/* Logo + title */}
            <div className="flex items-center gap-3">
                <Image
                    src="/logo/CAgov-logo.svg"
                    alt="California Government Logo"
                    width={40}
                    height={40}
                    className="h-10 w-auto object-contain"
                    priority
                />
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        EPIC Database
                    </p>
                    <p className="text-sm font-semibold text-slate-800">Documentation</p>
                </div>
            </div>

            {/* Gradient rule */}
            <div
                className="h-px w-full rounded-full"
                style={{ background: BRAND_GRADIENT }}
            />

            {/* Nav items */}
            <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`group relative flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                                isActive
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <span
                                className={`mt-0.5 ${isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-600'}`}
                            >
                                {item.icon}
                            </span>
                            <span>
                                <span className="block text-sm font-medium">{item.label}</span>
                                <span
                                    className={`block text-[11px] ${isActive ? 'text-slate-400' : 'text-slate-400'}`}
                                >
                                    {item.sub}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* FAQ link */}
            <div className="mt-auto">
                <Link
                    href="/faq"
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-800"
                >
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    FAQ &amp; Help Center
                </Link>
            </div>
        </aside>
    );
}
