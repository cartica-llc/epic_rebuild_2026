// components/dashboard/program_admin/DashboardSummaryBanner.tsx

'use client';

import type { DashboardKPIs } from '@/app/(dashboard)/dashboard/program/page';

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
}

export function DashboardSummaryBanner({ kpis }: { kpis: DashboardKPIs }) {
    return (
        <div className="rounded-2xl bg-slate-100 px-5 py-4">
            <p className="text-sm leading-relaxed text-slate-700">
                You are managing{' '}
                <span className="font-semibold text-slate-900">
                    {kpis.activeProjects.toLocaleString()} active project{kpis.activeProjects !== 1 ? 's' : ''}
                </span>{' '}
                with{' '}
                <span className="font-semibold text-slate-900">
                    {formatCurrency(kpis.totalCommittedFunding)}
                </span>{' '}
                in committed funding and{' '}
                <span className="font-semibold text-slate-900">
                    {kpis.dacLiSpendPct.toFixed(2)}%
                </span>{' '}
                of spend supporting DAC / LI communities.
                {kpis.inactiveProjects > 0 && (
                    <>
                        {' '}
                        <span className="text-amber-700">
                            {kpis.inactiveProjects.toLocaleString()} project{kpis.inactiveProjects !== 1 ? 's are' : ' is'} currently unpublished.
                        </span>
                    </>
                )}
            </p>
        </div>
    );
}
