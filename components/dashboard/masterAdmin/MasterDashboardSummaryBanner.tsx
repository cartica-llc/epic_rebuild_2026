// components/dashboard/masterAdmin/MasterDashboardSummaryBanner.tsx

'use client';

import type { MasterDashboardBannerStats } from '@/app/(dashboard)/dashboard/master/page';

export function MasterDashboardSummaryBanner({ stats }: { stats: MasterDashboardBannerStats }) {
    return (
        <div className="rounded-2xl bg-slate-100 px-5 py-4">
            <p className="text-sm leading-relaxed text-slate-700">
                There {stats.activeProjects === 1 ? 'is' : 'are'} currently{' '}
                <span className="font-semibold text-slate-900">
                    {stats.activeProjects.toLocaleString()} active project{stats.activeProjects !== 1 ? 's' : ''}
                </span>
                {' '}published on the site.
                {stats.inactiveProjects > 0 && (
                    <>
                        {' '}
                        <span className="text-amber-700">
                            {stats.inactiveProjects.toLocaleString()} project{stats.inactiveProjects !== 1 ? 's are' : ' is'} currently unpublished.
                        </span>
                    </>
                )}
            </p>
        </div>
    );
}