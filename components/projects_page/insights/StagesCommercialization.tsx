'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from 'recharts';
import { Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────
type SignalBand = 'Strong' | 'Emerging' | 'Early';

export type CommercializationProject = {
    PROJECT_ID: number;
    PROJECT_NUMBER: string;
    PROJECT_NAME: string;
    LEAD_COMPANY: string;
    PROGRAM_ADMIN: string;
    INVESTMENT_AREAS: string;
    MATURITY: string;
    SIGNAL_SCORE: number;
    SIGNAL_BAND: SignalBand;
};

// ─── TODO: Replace with Snowflake query ──────────────────────────────
const projects: CommercializationProject[] = [];

// ─── Constants ───────────────────────────────────────────────────────
const MATURITY_ORDER = ['Near-market', 'Validation', 'Development', 'Demonstration / Build', 'Early R&D', 'Unstaged'] as const;

const COLORS = {
    fillStrong: '#0f172a',
    fillEmerging: '#0ea5e9',
    fillLight: '#cbd5e1',
    fillDark: '#334155',
    fillMid: '#64748b',
    textMuted: '#64748b',
    line: '#e2e8f0',
    surface: '#ffffff',
    text: '#0f172a',
};

const MATURITY_FILLS: Record<string, string> = {
    'Near-market': COLORS.fillStrong,
    'Validation': COLORS.fillDark,
    'Development': COLORS.fillMid,
    'Demonstration / Build': COLORS.fillLight,
    'Early R&D': '#e2e8f0',
    'Unstaged': '#f1f5f9',
};

function Section({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 md:p-6">
            {(title || description) && (
                <div className="mb-5">
                    {title && <h4 className="text-base font-semibold text-slate-900">{title}</h4>}
                    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
            )}
            {children}
        </section>
    );
}

function PlaceholderBlock({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 py-16">
            <p className="text-xs text-slate-400">{label} — awaiting Snowflake data</p>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────
export function Insight_StagesCommercialization() {
    const [maturityFilter, setMaturityFilter] = React.useState<string | null>(null);
    const [signalFilter, setSignalFilter] = React.useState<SignalBand | null>(null);
    const [minScore, setMinScore] = React.useState(0);
    const [nearMarketOnly, setNearMarketOnly] = React.useState(false);
    const router = useRouter();

    const hasData = projects.length > 0;

    const maturityChartData = React.useMemo(() =>
            MATURITY_ORDER.map((m) => ({ name: m, count: projects.filter((p) => p.MATURITY === m).length })),
        []);

    // Filter projects for table
    let filteredProjects = [...projects];
    if (maturityFilter) filteredProjects = filteredProjects.filter((p) => p.MATURITY === maturityFilter);
    else if (nearMarketOnly) filteredProjects = filteredProjects.filter((p) => p.MATURITY === 'Near-market');
    if (signalFilter) filteredProjects = filteredProjects.filter((p) => p.SIGNAL_BAND === signalFilter);
    else if (minScore > 0) filteredProjects = filteredProjects.filter((p) => p.SIGNAL_SCORE >= minScore);

    const clearFilters = () => { setMaturityFilter(null); setSignalFilter(null); setMinScore(0); setNearMarketOnly(false); };
    const hasActiveFilters = maturityFilter !== null || signalFilter !== null || nearMarketOnly || minScore !== 0;

    return (
        <div className="space-y-6 rounded-3xl bg-slate-50 p-4 md:p-6">
            <Section title="Market Maturity Pipeline Overview" description="Portfolio distribution by maturity stage">
                {hasData ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={maturityChartData} layout="vertical" margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
                            <XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" tick={{ fill: COLORS.textMuted, fontSize: 11 }} width={160} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(value) => [String(value), 'Projects']} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer" barSize={24} onClick={(data) => { if (data?.name) setMaturityFilter(data.name); }}>
                                {maturityChartData.map((entry, i) => <Cell key={i} fill={MATURITY_FILLS[entry.name] ?? COLORS.fillLight} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <PlaceholderBlock label="Maturity pipeline chart" />
                )}
            </Section>

            <Section title="Market Readiness Signal Mix" description="Signal strength breakdown per stage">
                <PlaceholderBlock label="Signal breakdown bars" />
            </Section>

            <Section title="High-Potential Projects" description="Filter by stage and signal strength">
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-700">Filters</span>
                    </div>
                    <button onClick={() => setMinScore(minScore === 3 ? 0 : 3)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${minScore === 3 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200/70'}`}>Score 3+</button>
                    <button onClick={() => setMinScore(minScore === 4 ? 0 : 4)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${minScore === 4 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200/70'}`}>Score 4+</button>
                    <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={nearMarketOnly} onChange={(e) => setNearMarketOnly(e.target.checked)} className="h-3.5 w-3.5 rounded text-slate-900" />
                        <span className="text-xs text-slate-600">Near-market only</span>
                    </label>
                    {hasActiveFilters && <button onClick={clearFilters} className="ml-auto text-xs font-semibold text-slate-400 hover:text-slate-700">Reset</button>}
                </div>

                <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-left text-xs">
                        <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                            <th className="px-3 py-3 font-semibold">Project</th>
                            <th className="px-3 py-3 font-semibold">Maturity</th>
                            <th className="px-3 py-3 text-right font-semibold">Signal Score</th>
                            <th className="px-3 py-3 text-right font-semibold">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProjects.length === 0 ? (
                            <tr><td colSpan={4} className="py-8 text-center text-sm text-slate-400">No projects loaded. Connect Snowflake data.</td></tr>
                        ) : (
                            filteredProjects.map((p, i) => (
                                <tr key={p.PROJECT_ID} className={`${i % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'} border-b border-slate-100`}>
                                    <td className="px-3 py-3">
                                        <p className="text-xs font-medium text-slate-800">{p.PROJECT_NUMBER}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">{p.PROJECT_NAME.length > 60 ? `${p.PROJECT_NAME.slice(0, 60)}…` : p.PROJECT_NAME}</p>
                                    </td>
                                    <td className="px-3 py-3 text-xs text-slate-600">{p.MATURITY}</td>
                                    <td className="px-3 py-3 text-right">
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: p.SIGNAL_SCORE >= 4 ? COLORS.fillStrong : p.SIGNAL_SCORE >= 2 ? COLORS.fillEmerging : COLORS.fillLight, color: p.SIGNAL_SCORE >= 2 ? '#f8fafc' : COLORS.text }}>{p.SIGNAL_SCORE}/5</span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <button onClick={() => router.push(`/projects/${p.PROJECT_NUMBER}`)} className="text-xs font-semibold text-slate-500 hover:text-slate-900">View →</button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    );
}