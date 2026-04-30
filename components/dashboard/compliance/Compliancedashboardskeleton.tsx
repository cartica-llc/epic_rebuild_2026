// components/dashboard/compliance/ComplianceDashboardSkeleton.tsx

import { AlertTriangle, Download, Filter, Search } from 'lucide-react';

const ROW_COUNT = 8;

function Bar({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

function KpiCardSkeleton() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-200" />
                <Bar className="h-3 w-24" />
            </div>
            <Bar className="mt-2 h-7 w-12" />
            <Bar className="mt-1.5 h-3 w-20" />
        </div>
    );
}

/** Single project-row placeholder for the desktop table. */
function ProjectRowSkeleton() {
    return (
        <tr className="border-b border-slate-50">
            <td className="py-3 pl-4">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-200" />
            </td>
            <td className="py-3 pr-3">
                <div className="flex items-center gap-3">
                    <Bar className="h-3 w-20" />
                    <Bar className="h-3 flex-1" />
                </div>
            </td>
            <td className="py-3 pr-3">
                <Bar className="h-5 w-16 rounded-full" />
            </td>
            <td className="py-3 pr-3">
                <Bar className="h-3 w-12" />
            </td>
            <td className="py-3 pr-3">
                <Bar className="h-2 w-32 rounded-full" />
            </td>
            <td className="py-3 pr-3">
                <Bar className="h-5 w-24 rounded-full" />
            </td>
            <td className="py-3 pr-4">
                <Bar className="h-3.5 w-3.5" />
            </td>
        </tr>
    );
}

export function ComplianceDashboardSkeleton() {
    return (
        <div className="mt-38 max-w-7xl m-auto px-6 space-y-5" aria-busy="true" aria-live="polite">
            {/* Header — keep the title fixed and only skeletonize the count */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-slate-500" />
                        <h2 className="text-base font-semibold text-slate-900">
                            Compliance &amp; Operational Tracking
                        </h2>
                    </div>
                    <Bar className="mt-1 h-3 w-56" />
                </div>

                <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-400"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export Excel
                </button>
            </div>

            {/* KPI cards — three placeholders, same grid as live */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            {/* Filter toolbar — show the inputs disabled rather than blank,
                so users know what controls will be available. */}
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-[180px] flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
                        <div className="h-7 rounded-lg border border-slate-200 bg-slate-50" />
                    </div>
                    <Bar className="h-7 w-32 rounded-lg" />
                    <Bar className="h-7 w-32 rounded-lg" />
                    <Bar className="h-7 w-40 rounded-lg" />
                    <Bar className="h-7 w-32 rounded-lg" />
                    <span className="ml-auto inline-flex items-center text-[11px] text-slate-400">
                        <Filter className="-mt-0.5 mr-1 inline-block h-3 w-3" />
                        Loading…
                    </span>
                </div>
            </div>

            {/* Project list — table on desktop, cards on mobile */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="hidden lg:block">
                    <table className="w-full table-fixed text-left text-xs">
                        <colgroup>
                            <col className="w-8" />
                            <col />
                            <col className="w-24" />
                            <col className="w-20" />
                            <col className="w-44" />
                            <col className="w-36" />
                            <col className="w-8" />
                        </colgroup>
                        <thead>
                        <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="py-2.5 pl-4" />
                            <th className="py-2.5 pr-3 font-medium">Project</th>
                            <th className="py-2.5 pr-3 font-medium">Status</th>
                            <th className="py-2.5 pr-3 font-medium">Period</th>
                            <th className="py-2.5 pr-3 font-medium">Fields</th>
                            <th className="py-2.5 pr-3 font-medium">Flags</th>
                            <th className="py-2.5 pr-4" />
                        </tr>
                        </thead>
                        <tbody>
                        {Array.from({ length: ROW_COUNT }).map((_, i) => (
                            <ProjectRowSkeleton key={i} />
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile card list */}
                <div className="divide-y divide-slate-100 lg:hidden">
                    {Array.from({ length: ROW_COUNT }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-4">
                            <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-slate-200" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Bar className="h-3 w-20" />
                                    <Bar className="h-5 w-16 rounded-full" />
                                </div>
                                <Bar className="h-4 w-3/4" />
                                <Bar className="h-2 w-full rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <span className="sr-only">Loading compliance data…</span>
        </div>
    );
}