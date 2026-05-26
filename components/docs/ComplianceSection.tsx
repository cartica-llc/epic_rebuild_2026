// components/docs/ComplianceSection.tsx
'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';
import { BRAND_GRADIENT } from './brand';

type TabId = 'new-project' | 'quarterly' | 'closeout';

interface StageField { label: string; note?: string; }
interface Stage {
    id: TabId;
    title: string;
    subtitle: string;
    description: string;
    fields: StageField[];
}

const STAGES: Stage[] = [
    {
        id: 'new-project',
        title: 'New Project',
        subtitle: 'Required at project initiation',
        description: 'All of the following fields must be completed when a new project is added. A project cannot be created without all required information entered.',
        fields: [
            { label: 'Project Name' }, { label: 'Project Number' },
            { label: 'Project Start Date' }, { label: 'Project End Date' },
            { label: 'Project Award Date' }, { label: 'Project Status' },
            { label: 'Project Lead Contact Information' }, { label: 'Assembly District' },
            { label: 'Senate District' }, { label: 'Project Type' },
            { label: 'Investment Program Period' }, { label: 'Classification of the Business' },
            { label: 'Investment Area' }, { label: 'CPUC Proceeding(s) Project is Linked To' },
            { label: 'Project Lead' }, { label: 'Project Address' },
            { label: 'Program Administrator' }, { label: 'Detailed Project Description' },
            { label: 'Project Summary' }, { label: 'Project Deliverables' },
            { label: 'How it Supports State Policy' }, { label: 'Technical Barriers' },
            { label: 'Market Barriers' }, { label: 'Getting to Scale' },
            { label: 'Key Innovations' }, { label: 'Utility Service Area' },
            { label: 'Project Funding Mechanism' },
            { label: 'Competitive Selection Details', note: 'If competitively selected' },
            { label: 'Projected Project Benefits' },
        ],
    },
    {
        id: 'quarterly',
        title: 'Quarterly Update',
        subtitle: 'Apr / Jul / Oct / Jan',
        description: 'Review and update the following fields each quarter. Some are required every quarter; others are reviewed annually or updated only when changes occur.',
        fields: [
            { label: 'Project Committed Funding Amount', note: 'Every quarter' },
            { label: 'Project Funds Expended to Date', note: 'Every quarter' },
            { label: 'Match Funding', note: 'Every quarter' },
            { label: 'Leveraged Funds', note: 'Every quarter' },
            { label: 'Project End Date', note: 'Q1 / Annual' },
            { label: 'Development Stage', note: 'Q1 / Annual' },
            { label: 'Project Partners', note: 'Q1 / Annual' },
            { label: 'Project Update', note: 'Q1 / Annual' },
            { label: 'Match Funding Partners', note: 'Q1 / Annual' },
            { label: 'Project Encumbered Funding Amount', note: 'Q1 / Annual' },
            { label: 'Project Administrative and Overhead Cost', note: 'Q1 / Annual' },
            { label: 'Total Project Match Funding', note: 'Q1 / Annual' },
            { label: 'Electricity System Reliability Impacts', note: 'Q1 / Annual' },
            { label: 'Electricity System Safety Impacts', note: 'Q1 / Annual' },
            { label: 'Policy and Regulatory Barriers', note: 'Q1 / Annual' },
            { label: 'Cybersecurity Considerations', note: 'Q1 / Annual' },
            { label: 'Energy Efficiency Workpaper Data', note: 'Q1 / Annual' },
            { label: 'Community Benefits', note: 'Q1 / Annual' },
            { label: 'Project Name', note: 'If needed' },
            { label: 'Project Lead', note: 'If needed' },
            { label: 'Project Status', note: 'If needed' },
            { label: 'Project Lead Contact Information', note: 'If needed' },
            { label: 'Assembly District', note: 'If needed' },
            { label: 'Senate District', note: 'If needed' },
            { label: 'Project Type', note: 'If needed' },
            { label: 'Classification of the Business', note: 'If needed' },
            { label: 'Detailed Project Description', note: 'If needed' },
            { label: 'Project Summary', note: 'If needed' },
            { label: 'Project Deliverables', note: 'If needed' },
            { label: 'How it Supports State Policy', note: 'If needed' },
            { label: 'Technical Barriers', note: 'If needed' },
            { label: 'Market Barriers', note: 'If needed' },
            { label: 'Getting to Scale', note: 'If needed' },
            { label: 'Key Innovations', note: 'If needed' },
            { label: 'Utility Service Area', note: 'If needed' },
            { label: 'Projected Project Benefits', note: 'If needed' },
        ],
    },
    {
        id: 'closeout',
        title: 'Project Closeout',
        subtitle: 'On project completion',
        description: 'When a project is completed and a final report is available, fill in all of the following fields during the next quarterly update.',
        fields: [
            { label: 'Project Status', note: 'Set to Completed / Closed' },
            { label: 'Standards' }, { label: 'Confidential Information Categories' },
            { label: 'CPUC Proceeding(s) Project is Linked To' }, { label: 'Key Learnings' },
            { label: 'Scalability' }, { label: 'Final Report Upload' },
            { label: 'Cybersecurity Narrative' }, { label: 'GHG Impacts' },
            { label: 'Environmental Impact – non-GHG' }, { label: 'Ratepayer Benefits' },
            { label: 'Community Benefits Description' }, { label: 'Energy Impacts' },
            { label: 'Infrastructure Cost Reductions and Other Economic Benefits' },
            { label: 'Other Impacts' }, { label: 'Information Dissemination' },
        ],
    },
];

const NOTE_STYLES: Record<string, string> = {
    'Every quarter': 'bg-slate-100 text-slate-600',
    'Q1 / Annual':   'bg-slate-100 text-slate-500',
    'If needed':     'bg-slate-50  text-slate-400',
};

const TABS: { id: TabId; label: string; sub: string }[] = [
    { id: 'new-project', label: 'New Project',       sub: 'At initiation' },
    { id: 'quarterly',   label: 'Quarterly Update',  sub: 'Apr / Jul / Oct / Jan' },
    { id: 'closeout',    label: 'Project Closeout',  sub: 'On completion' },
];


function StagePanel({ stage }: { stage: Stage }) {
    const required    = stage.fields.filter((f) => !f.note || f.note === 'Every quarter');
    const conditional = stage.fields.filter((f) => f.note && f.note !== 'Every quarter');

    return (
        <div>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">{stage.description}</p>

            <div className="mb-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Required — {required.length} fields
                </p>
                <div className="grid grid-cols-1 gap-y-1.5 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                    {required.map((f) => (
                        <div key={f.label} className="flex items-start gap-2 text-[12px] text-slate-700">
                            <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                            {f.label}
                        </div>
                    ))}
                </div>
            </div>

            {conditional.length > 0 && (
                <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Scheduled &amp; Conditional — {conditional.length} fields
                    </p>
                    <div className="space-y-1.5">
                        {conditional.map((f) => (
                            <div key={f.label} className="flex items-center gap-3 text-[12px]">
                                <span className="h-1 w-1 shrink-0 rounded-full bg-slate-200" />
                                <span className="flex-1 text-slate-600">{f.label}</span>
                                {f.note && (
                                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${NOTE_STYLES[f.note] ?? 'bg-slate-50 text-slate-400'}`}>
                                        {f.note}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


export function ComplianceSection() {
    const [activeTab, setActiveTab] = useState<TabId | null>(null);

    const activeStage = STAGES.find((s) => s.id === activeTab);

    return (
        <section className="py-14">
            {/* Section header */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900">Project Compliance</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Required fields by project lifecycle stage.
                </p>
            </div>

            {/* Tab bar */}
            <div className="mb-8 flex gap-0 border-b border-slate-100">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex flex-col items-start px-5 pb-3 pt-1 text-left transition-colors ${
                                isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <span className="text-sm font-medium">{tab.label}</span>
                            <span className="text-[10px] text-slate-400">{tab.sub}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="compliance-tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5"
                                    style={{ background: BRAND_GRADIENT }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {activeStage && (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                    >
                        <StagePanel stage={activeStage} />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}