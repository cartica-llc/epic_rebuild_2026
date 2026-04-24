'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { ChevronDown, BarChart3 } from 'lucide-react';

// ─── Types (matches Snowflake schema) ────────────────────────────────
export type ProjectRow = {
    id: number;
    projectNumber: string;
    name: string;
    status: string;
    period: string;
    projectLead: string;
    investmentAreas: string[];
    committedAmount: number;
    contractedAmount: number;
    expendedAmount: number;
    isDacLi: boolean;
    matchFunding: number;
    leveragedFunds: number;
    matchFundingSplit: number;
};

type MetricMode = 'Committed Amount' | 'Contracted Amount' | 'Expended Amount';
type InsightTab = 'spending' | 'leverage' | 'awards' | 'community';

// ─── TODO: Replace with Snowflake query ──────────────────────────────
const PROJECT_DATA: ProjectRow[] = [];
const ALL_PERIODS: string[] = [];
const ALL_INVESTMENT_AREAS: string[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────
const formatMoneyShort = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${Math.round(n).toLocaleString()}`;
};

function SummaryCard({ label, value, subvalue }: { label: string; value: string; subvalue?: string }) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
            {subvalue && <p className="mt-1 text-xs text-slate-500">{subvalue}</p>}
        </div>
    );
}

function PlaceholderSection({ title, description }: { title: string; description: string }) {
    return (
        <section className="rounded-md border border-slate-200 bg-white p-4 md:p-5">
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
            <div className="mt-6 flex items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 py-16">
                <p className="text-xs text-slate-400">Awaiting Snowflake data connection</p>
            </div>
        </section>
    );
}

// ─── Main Component ──────────────────────────────────────────────────
export function Insight_SpendingAnalysis() {
    const [metric, setMetric] = React.useState<MetricMode>('Committed Amount');
    const [period, setPeriod] = React.useState('All');
    const [area, setArea] = React.useState('All');
    const [activeTab, setActiveTab] = React.useState<InsightTab>('spending');

    const rows = React.useMemo(
        () => PROJECT_DATA.filter((r) => {
            if (period !== 'All' && r.period !== period) return false;
            if (area !== 'All' && !r.investmentAreas.includes(area)) return false;
            return true;
        }),
        [period, area],
    );

    const totals = React.useMemo(() => ({
        committed: rows.reduce((s, r) => s + r.committedAmount, 0),
        contracted: rows.reduce((s, r) => s + r.contractedAmount, 0),
        expended: rows.reduce((s, r) => s + r.expendedAmount, 0),
        count: rows.length,
    }), [rows]);

    const primaryValue =
        metric === 'Committed Amount' ? totals.committed
            : metric === 'Contracted Amount' ? totals.contracted
                : totals.expended;

    const reset = () => { setMetric('Committed Amount'); setPeriod('All'); setArea('All'); };

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="relative bg-white px-4 py-6 md:px-6 md:py-8">
                <div className="space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                                Spending &amp; Investment Analysis
                            </h2>
                            <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-slate-500">
                                Filters persist across every analysis tab. Adjust metric, period, or area to refine the view.
                            </p>
                        </div>
                        <button onClick={reset} className="self-start rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900">
                            Reset filters
                        </button>
                    </div>

                    {/* Filter controls */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {([
                            { value: metric, onChange: (v: string) => setMetric(v as MetricMode), label: 'Metric', options: [{ value: 'Committed Amount', label: 'Committed' }, { value: 'Contracted Amount', label: 'Contracted' }, { value: 'Expended Amount', label: 'Expended' }] },
                            { value: period, onChange: setPeriod, label: 'EPIC Period', options: [{ value: 'All', label: 'All Periods' }, ...ALL_PERIODS.map((p) => ({ value: p, label: p }))] },
                            { value: area, onChange: setArea, label: 'Investment Area', options: [{ value: 'All', label: 'All Areas' }, ...ALL_INVESTMENT_AREAS.map((a) => ({ value: a, label: a }))] },
                        ] as const).map((f) => (
                            <div key={f.label}>
                                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">{f.label}</label>
                                <div className="relative">
                                    <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
                                        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

                    {/* Tabs */}
                    <div>
                        <div className="mb-3 flex items-center gap-2.5">
                            <BarChart3 className="h-4 w-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500">Analysis view</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {([
                                { key: 'spending' as InsightTab, label: 'Spending Overview' },
                                { key: 'leverage' as InsightTab, label: 'Leverage & Match' },
                                { key: 'awards' as InsightTab, label: 'Award Size' },
                                { key: 'community' as InsightTab, label: 'Community Requirements' },
                            ]).map((tab) => (
                                <button
                                    key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                                    className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${activeTab === tab.key ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6">
                    <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #0f172a 8%, #64748b 40%, #cbd5e1 70%, transparent)' }} />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-5 px-4 py-5 md:px-6 md:py-6">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <SummaryCard label={metric} value={formatMoneyShort(primaryValue)} />
                    <SummaryCard label="Contracted Total" value={formatMoneyShort(totals.contracted)} />
                    <SummaryCard label="Expended Total" value={formatMoneyShort(totals.expended)} />
                    <SummaryCard label="Projects" value={totals.count.toLocaleString()} />
                </div>

                {activeTab === 'spending' && (
                    <div className="space-y-5">
                        <PlaceholderSection title="Spending by investment area" description="Layered bars: committed, contracted, expended." />
                        <PlaceholderSection title="Spending by EPIC period" description="Bar chart by period." />
                        <PlaceholderSection title="Top project leads" description="Horizontal bar chart." />
                    </div>
                )}
                {activeTab === 'leverage' && <PlaceholderSection title="Leverage & Match Funding" description="Match funding, leveraged funds, and ratio." />}
                {activeTab === 'awards' && <PlaceholderSection title="Award Size Distribution" description="Performance by award size band." />}
                {activeTab === 'community' && <PlaceholderSection title="Community Requirements (DAC/LI)" description="DAC/LI share by period and investment area." />}
            </div>
        </div>
    );
}

export default Insight_SpendingAnalysis;