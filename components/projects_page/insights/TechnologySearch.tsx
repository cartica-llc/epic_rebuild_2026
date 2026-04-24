'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronDown, ChevronUp, ArrowRight, BarChart3 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────
type NarrativeLens = 'innovations' | 'barriers' | 'learnings' | 'summary';

export type NarrativeProject = {
    PROJECT_ID: number;
    PROJECT_NUMBER: string;
    PROJECT_NAME: string;
    PROJECT_STATUS: string;
    PROJECT_LEAD: string;
    SUMMARY_PROJECT_DESCRIPTION: string;
    KEY_INNOVATIONS: string;
    KEY_LEARNINGS: string;
    TECHNICAL_BARRIERS: string;
    MARKET_BARRIERS: string;
    POLICY_AND_REGULATORY_BARRIERS: string;
    COMMITTED_FUNDING_AMT: number;
    INVESTMENT_AREAS: string;
    CPUC_PROCEEDINGS: string;
    COMMUNITY_BENEFITS: number;
    CYBER_SECURITY_CONSIDERATIONS: number;
    CPUC_DACLI: number;
};

// ─── TODO: Replace with Snowflake query ──────────────────────────────
const projects: NarrativeProject[] = [];

const STARTER_TOPICS = ['Hydropower', 'Climate', 'Resilience', 'Building Decarbonization', 'Direct Current', 'Microgrid'];
const LENS_OPTIONS: { key: NarrativeLens; label: string }[] = [
    { key: 'innovations', label: 'Innovations' },
    { key: 'barriers', label: 'Challenges / Barriers' },
    { key: 'learnings', label: 'Learnings' },
    { key: 'summary', label: 'Summary' },
];

function formatFunding(amount?: number) {
    if (!amount) return 'N/A';
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
}

function splitMultiValue(value?: string) {
    return (value || '').split(',').map((s) => s.trim()).filter(Boolean);
}

// ─── Component ───────────────────────────────────────────────────────
export function Insight_TechnologySearch() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedArea, setSelectedArea] = React.useState('');
    const [selectedProceeding, setSelectedProceeding] = React.useState('');
    const [selectedStatus, setSelectedStatus] = React.useState('');
    const [selectedLens, setSelectedLens] = React.useState<NarrativeLens | null>(null);
    const [showFilters, setShowFilters] = React.useState(false);

    const investmentAreas = React.useMemo(() => Array.from(new Set(projects.flatMap((p) => splitMultiValue(p.INVESTMENT_AREAS)))).sort(), []);
    const cpucProceedings = React.useMemo(() => Array.from(new Set(projects.flatMap((p) => splitMultiValue(p.CPUC_PROCEEDINGS)))).sort(), []);
    const statuses = React.useMemo(() => Array.from(new Set(projects.map((p) => p.PROJECT_STATUS).filter(Boolean))).sort(), []);

    const hasSearchIntent = Boolean(searchTerm.trim()) || Boolean(selectedArea) || Boolean(selectedProceeding) || Boolean(selectedStatus);

    const filteredProjects = React.useMemo(() => {
        if (!hasSearchIntent) return [];
        return projects.filter((p) => {
            const blob = [p.PROJECT_NAME, p.KEY_INNOVATIONS, p.KEY_LEARNINGS, p.SUMMARY_PROJECT_DESCRIPTION, p.INVESTMENT_AREAS].join(' ').toLowerCase();
            if (searchTerm.trim() && !blob.includes(searchTerm.trim().toLowerCase())) return false;
            if (selectedArea && !splitMultiValue(p.INVESTMENT_AREAS).includes(selectedArea)) return false;
            if (selectedProceeding && !splitMultiValue(p.CPUC_PROCEEDINGS).includes(selectedProceeding)) return false;
            if (selectedStatus && p.PROJECT_STATUS !== selectedStatus) return false;
            return true;
        });
    }, [hasSearchIntent, searchTerm, selectedArea, selectedProceeding, selectedStatus]);

    const totalFunding = filteredProjects.reduce((s, p) => s + (p.COMMITTED_FUNDING_AMT || 0), 0);

    const clearAll = () => {
        setSearchTerm(''); setSelectedArea(''); setSelectedProceeding(''); setSelectedStatus('');
        setSelectedLens(null); setShowFilters(false);
    };

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="relative bg-white px-4 py-6 md:px-6 md:py-8">
                <div className="space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Has this been tried?</h2>
                            <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-slate-500">Search similar EPIC projects and preview summaries, innovations, learnings, and barriers.</p>
                        </div>
                        {hasSearchIntent && (
                            <button type="button" onClick={clearAll} className="self-start rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm hover:text-slate-900">Reset all</button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search hydropower, climate, microgrid…" className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
                        {searchTerm && <button type="button" onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"><X className="h-3.5 w-3.5" /></button>}
                    </div>

                    {/* Quick topics */}
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Popular topics</p>
                        <div className="flex flex-wrap gap-2">
                            {STARTER_TOPICS.map((topic) => (
                                <button key={topic} type="button" onClick={() => setSearchTerm(searchTerm.toLowerCase() === topic.toLowerCase() ? '' : topic)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${searchTerm.toLowerCase() === topic.toLowerCase() ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-slate-900'}`}>{topic}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

                    {/* Lens */}
                    <div>
                        <div className="mb-3 flex items-center gap-2.5">
                            <BarChart3 className="h-4 w-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500">View results by</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {LENS_OPTIONS.map((item) => (
                                <button key={item.key} type="button" onClick={() => setSelectedLens(selectedLens === item.key ? null : item.key)} className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${selectedLens === item.key ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-slate-900'}`}>{item.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* Expandable filters */}
                    <div>
                        <button type="button" onClick={() => setShowFilters((v) => !v)} className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${showFilters ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-slate-900'}`}>
                            Filters <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        {([
                                            { label: 'Investment Area', value: selectedArea, onChange: setSelectedArea, options: investmentAreas },
                                            { label: 'CPUC Proceeding', value: selectedProceeding, onChange: setSelectedProceeding, options: cpucProceedings },
                                            { label: 'Project Status', value: selectedStatus, onChange: setSelectedStatus, options: statuses },
                                        ] as const).map((f) => (
                                            <div key={f.label}>
                                                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">{f.label}</label>
                                                <div className="relative">
                                                    <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
                                                        <option value="">All</option>
                                                        {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6">
                    <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #0f172a 8%, #64748b 40%, #cbd5e1 70%, transparent)' }} />
                </div>
            </div>

            {/* Results */}
            {hasSearchIntent && (
                <div className="space-y-5 px-4 py-5 md:px-6 md:py-6">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-md border border-slate-200 bg-white p-4">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Projects</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">{filteredProjects.length}</p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-white p-4">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Committed Funding</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">{formatFunding(totalFunding)}</p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-white p-4">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Active Lens</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">{LENS_OPTIONS.find((l) => l.key === selectedLens)?.label ?? 'Best available'}</p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-white p-4">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Filters Applied</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">{[selectedArea, selectedProceeding, selectedStatus].filter(Boolean).length}</p>
                        </div>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="rounded-md border border-slate-200 bg-white p-10 text-center">
                            <p className="mb-1 text-sm font-semibold text-slate-900">No matching projects</p>
                            <p className="text-sm text-slate-500">{projects.length === 0 ? 'Connect Snowflake data to populate results.' : 'Try a broader term or adjust filters.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProjects.map((project) => (
                                <section key={project.PROJECT_ID} className="rounded-md border border-slate-200 bg-white p-4 md:p-5">
                                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{project.PROJECT_NUMBER}</div>
                                    <h4 className="mb-2 text-sm font-semibold text-slate-900">{project.PROJECT_NAME}</h4>
                                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                                        <span><span className="font-medium text-slate-700">Lead:</span> {project.PROJECT_LEAD || 'Not listed'}</span>
                                        <span><span className="font-medium text-slate-700">Committed:</span> {formatFunding(project.COMMITTED_FUNDING_AMT)}</span>
                                    </div>
                                    <div className="mt-3">
                                        <button type="button" onClick={() => router.push(`/projects/${project.PROJECT_ID}`)} className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900">
                                            View project <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}