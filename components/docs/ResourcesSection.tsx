// components/docs/ResourcesSection.tsx
'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ExternalLink, Globe, Mail, Phone } from 'lucide-react';
import { BRAND_GRADIENT } from './brand';

interface Resource {
    id: string;
    title: string;
    description: string;
    href: string;
    category: 'program' | 'utility' | 'policy';
}

const RESOURCES: Resource[] = [
    {
        id: 'cpuc',
        category: 'policy',
        title: 'CPUC Energy R&D / EPIC Rulemaking',
        description: 'California Public Utilities Commission page covering EPIC oversight, proceedings, and strategic objectives for the current investment period.',
        href: 'https://www.cpuc.ca.gov/energyrdd/',
    },
    {
        id: 'cec-epic',
        category: 'program',
        title: 'CEC EPIC Program Home',
        description: 'Official California Energy Commission page for the Electric Program Investment Charge program, including solicitations and research priorities.',
        href: 'https://www.energy.ca.gov/programs-and-topics/programs/electric-program-investment-charge-epic-program',
    },
    {
        id: 'sce',
        category: 'utility',
        title: 'Southern California Edison — EPIC',
        description: "SCE's dedicated EPIC program page with program background, project listings, and information on the current investment period.",
        href: 'https://www.sce.com/regulatory/regulatory-information/epic',
    },
    {
        id: 'sdge',
        category: 'utility',
        title: 'SDG&E — EPIC',
        description: "San Diego Gas & Electric's EPIC program page including CPUC decisions, triennial plans, and project documentation.",
        href: 'https://www.sdge.com/epic',
    },
    {
        id: 'pge',
        category: 'utility',
        title: 'PG&E — Research & Development',
        description: "Pacific Gas & Electric's R&D page covering EPIC-funded projects, innovation initiatives, and completed project final reports.",
        href: 'https://www.pge.com/en/about/corporate-responsibility-and-sustainability/taking-responsibility/emerging-electric-technology-programs.html',
    },
];

const CATEGORY_LABELS: Record<Resource['category'], string> = {
    program: 'EPIC Program',
    utility: 'Utility',
    policy: 'Policy',
};

interface Partner {
    id: string;
    name: string;
    role: string;
    description?: string;
    contact?: string;
    phone?: string;
    website?: string;
}

const PARTNERS: Partner[] = [
    {
        id: 'accelerate-group',
        name: 'The Accelerate Group',
        role: 'PICG Project Coordinator',
        contact: 'picg@theaccelerategroup.com',
    },
    {
        id: 'cec-contact',
        name: 'California Energy Commission',
        role: 'Program Administrator & Funder',
        contact: 'epic@energy.ca.gov',
        phone: '(916) 654-4058',
        website: 'https://www.energy.ca.gov',
    },
    {
        id: 'sce-contact',
        name: 'Southern California Edison',
        role: 'Investor-Owned Utility Partner (SCE)',
        website: 'https://www.sce.com',
    },
    {
        id: 'sdge-contact',
        name: 'SDG&E',
        role: 'Investor-Owned Utility Partner (SDG&E)',
        website: 'https://www.sdge.com',
    },
    {
        id: 'pge-contact',
        name: 'PG&E',
        role: 'Investor-Owned Utility Partner (PG&E)',
        website: 'https://www.pge.com',
    }
];

const PREVIEW_RESOURCES = RESOURCES.slice(0, 3);

function ResourceCard({ resource }: { resource: Resource }) {
    return (
        <a
            href={resource.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-5 transition-all hover:border-slate-200 hover:shadow-sm"
        >
            <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {CATEGORY_LABELS[resource.category]}
                </span>
                <ExternalLink className="h-3 w-3 shrink-0 text-slate-300 transition-colors group-hover:text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">{resource.title}</h3>
            <p className="text-[12px] leading-relaxed text-slate-500">{resource.description}</p>
        </a>
    );
}

function PartnerCard({ partner }: { partner: Partner }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800">{partner.name}</h3>
            <p className="mt-0.5 text-[11px] text-slate-400">{partner.role}</p>
            {partner.description && (
                <p className="mt-2 mb-1 text-[12px] leading-relaxed text-slate-500">{partner.description}</p>
            )}
            <div className={`space-y-1.5 ${partner.description ? 'mt-2' : 'mt-3'}`}>
                {partner.contact && (
                    <a href={`mailto:${partner.contact}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800">
                        <Mail className="h-3 w-3 text-slate-300" />{partner.contact}
                    </a>
                )}
                {partner.phone && (
                    <a href={`tel:${partner.phone}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800">
                        <Phone className="h-3 w-3 text-slate-300" />{partner.phone}
                    </a>
                )}
                {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800">
                        <Globe className="h-3 w-3 text-slate-300" />{partner.website.replace('https://', '')}
                    </a>
                )}
            </div>
        </div>
    );
}

export function ResourcesSection() {
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="py-14">
            {/* Section header */}
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Resources &amp; Partners</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        External links and contact information for EPIC program stakeholders.
                    </p>
                </div>
                <button
                    onClick={() => setExpanded((p) => !p)}
                    className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
                >
                    <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4" />
                    </motion.div>
                    {expanded ? 'Show less' : 'Show all'}
                </button>
            </div>

            {/* Preview grid — always visible */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PREVIEW_RESOURCES.map((r) => <ResourceCard key={r.id} resource={r} />)}
            </div>

            {/* Expanded */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        {/* Remaining resource cards */}
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {RESOURCES.slice(3).map((r) => <ResourceCard key={r.id} resource={r} />)}
                        </div>

                        {/* Partners subsection */}
                        <div className="mt-12">
                            <div className="mb-1 h-px w-full" style={{ background: BRAND_GRADIENT }} />
                            <div className="mb-6 mt-8">
                                <h3 className="text-base font-semibold text-slate-800">Program Partners</h3>
                                <p className="mt-0.5 text-sm text-slate-400">Primary contacts across program administrators and utility partners.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {PARTNERS.map((p) => <PartnerCard key={p.id} partner={p} />)}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}