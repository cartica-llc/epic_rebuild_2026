// components/dashboard/masterAdmin/MasterAdminDashboardSkeleton.tsx


const ROW_COUNT = 5;

function Bar({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

function ProjectRowSkeleton({ alt }: { alt: boolean }) {
    return (
        <tr className={`border-b border-slate-100 ${alt ? 'bg-slate-50/40' : 'bg-white'}`}>
            <td className="px-3 py-3">
                <Bar className="h-3 w-24" />
            </td>
            <td className="w-48 max-w-[10rem] px-3 py-3">
                <Bar className="h-3 w-full" />
            </td>
            <td className="w-32 max-w-[8rem] px-3 py-3">
                <Bar className="h-3 w-20" />
            </td>
            <td className="px-3 py-3">
                <div className="flex justify-end">
                    <Bar className="h-7 w-12 rounded-lg" />
                </div>
            </td>
        </tr>
    );
}

function QuickActionsSkeleton() {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <Bar className="mb-4 h-4 w-28" />
            <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"
                    >
                        <Bar className="h-8 w-8 shrink-0 rounded-lg" />
                        <Bar className="h-4 flex-1" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MasterAdminDashboardSkeleton({
                                                 userName,
                                                 userEmail,
                                             }: {
    userName: string;
    userEmail: string;
}) {
    return (
        <main
            className="mx-auto mt-6 max-w-[1400px] px-4 sm:px-6 lg:px-8"
            aria-busy="true"
            aria-live="polite"
        >

            <div className="mb-8 flex items-center justify-between gap-4 ">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{userName}</h1>
                    <p className="mt-0.5 text-sm text-slate-500">{userEmail}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Master Admin — all organizations
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-2xl bg-slate-100 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm leading-relaxed text-slate-700">
                        <span>There are currently</span>
                        <Bar className="h-4 w-20" />
                        <span>published on the site.</span>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
                            {/* Tab strip */}
                            <div className="flex items-center justify-between border-b border-slate-200 px-5 pt-5">
                                <div className="flex gap-1">
                                    <div className="flex items-center gap-2 rounded-t-lg border-b-2 border-slate-900 px-4 py-2.5">
                                        <span className="text-sm font-medium text-slate-900">
                                            Recently Added
                                        </span>
                                        <Bar className="h-4 w-6 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2 rounded-t-lg px-4 py-2.5">
                                        <span className="text-sm font-medium text-slate-500">
                                            Unpublished
                                        </span>
                                        <Bar className="h-4 w-6 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Project list table */}
                            <div className="p-2">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                                                Project Number
                                            </th>
                                            <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                                                Project Name
                                            </th>
                                            <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                                                Created
                                            </th>
                                            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Array.from({ length: ROW_COUNT }).map((_, i) => (
                                            <ProjectRowSkeleton key={i} alt={i % 2 === 0} />
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <QuickActionsSkeleton />
                    </div>
                </div>
            </div>

            <span className="sr-only">Loading dashboard data…</span>
        </main>
    );
}