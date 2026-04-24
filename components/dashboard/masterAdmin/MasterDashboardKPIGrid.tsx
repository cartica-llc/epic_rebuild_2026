// components/dashboard/masterAdmin/MasterDashboardKPIGrid.tsx

'use client';

import type { MasterDashboardKPIs } from '@/app/(dashboard)/dashboard/master/page';

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
}

interface KPICardProps {
    label: string;
    value: string;
    sub?: string;
    accent?: boolean;
}

function KPICard({ label, value, sub, accent }: KPICardProps) {
    return (
        <div
            className={`rounded-2xl p-5 shadow-sm ring-1 ${
                accent ? 'bg-amber-50 ring-amber-200/70' : 'bg-white ring-slate-200/70'
            }`}
        >
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${accent ? 'text-amber-700' : 'text-slate-900'}`}>
                {value}
            </p>
            {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
    );
}

export function MasterDashboardKPIGrid({ kpis }: { kpis: MasterDashboardKPIs }) {
    const burnRate =
        kpis.totalCommittedFunding > 0
            ? ((kpis.fundsExpendedToDate / kpis.totalCommittedFunding) * 100).toFixed(1)
            : '0.0';

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KPICard label="Organizations" value={kpis.totalOrganizations.toLocaleString()} />
            <KPICard label="Active Projects" value={kpis.activeProjects.toLocaleString()} />
            <KPICard
                label="Unpublished Projects"
                value={kpis.inactiveProjects.toLocaleString()}
                accent={kpis.inactiveProjects > 0}
            />
            <KPICard label="Committed Funding" value={formatCurrency(kpis.totalCommittedFunding)} />
            <KPICard
                label="Spent to Date"
                value={formatCurrency(kpis.fundsExpendedToDate)}
                sub={`${burnRate}% burn rate`}
            />
            <KPICard
                label="DAC / LI Share"
                value={`${kpis.dacLiSpendPct.toFixed(2)}%`}
                sub="of committed spend"
            />
        </div>
    );
}
