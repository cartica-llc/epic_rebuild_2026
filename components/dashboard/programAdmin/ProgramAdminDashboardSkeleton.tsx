// components/dashboard/programAdmin/ProgramAdminDashboardSkeleton.tsx


import Image from 'next/image';

const ROW_COUNT = 5;
const KPI_COUNT = 5;
const ACTION_COUNT = 4;

const ADMIN_LOGOS: Record<
    number,
    { src: string; alt: string; width: number; height: number }
> = {
    0: { src: '/dashboardLogos/cec.png', alt: 'California Energy Commission', width: 120, height: 48 },
    1: { src: '/dashboardLogos/sce.svg', alt: 'Southern California Edison', width: 120, height: 48 },
    2: { src: '/dashboardLogos/sdge.svg', alt: 'San Diego Gas & Electric', width: 120, height: 48 },
    3: { src: '/dashboardLogos/pge.png', alt: 'Pacific Gas & Electric', width: 120, height: 48 },
};

function Bar({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

function KpiCardSkeleton() {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <Bar className="h-3 w-24" />
            <Bar className="mt-3 h-7 w-20" />
            <Bar className="mt-2 h-3 w-16" />
        </div>
    );
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
            <td className="px-3 py-3">
                <Bar className="h-5 w-16 rounded-full" />
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

function QuickActionSkeleton() {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-200/70">
            <Bar className="mt-0.5 h-4 w-4 shrink-0 rounded" />
            <div className="min-w-0 flex-1 space-y-1.5">
                <Bar className="h-4 w-24" />
                <Bar className="h-3 w-32" />
            </div>
        </div>
    );
}

export function ProgramAdminDashboardSkeleton({
                                                  userName,
                                                  userEmail,
                                                  userOrg,
                                                  isMasterAdmin,
                                                  programAdminId,
                                              }: {
    userName: string;
    userEmail: string;
    userOrg: string | null;
    isMasterAdmin: boolean;
    programAdminId: number | null;
}) {
    return (
        <main
            className="mx-auto mt-6 max-w-[1400px] px-4 sm:px-6 lg:px-8"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{userName}</h1>
                    <p className="mt-0.5 text-sm text-slate-500">{userEmail}</p>
                    {userOrg && (
                        <p className="mt-0.5 text-xs text-slate-400">
                            {isMasterAdmin ? 'Master Admin — all organizations' : userOrg}
                        </p>
                    )}
                </div>
                {programAdminId !== null && ADMIN_LOGOS[programAdminId] && (
                    <Image
                        src={ADMIN_LOGOS[programAdminId].src}
                        alt={ADMIN_LOGOS[programAdminId].alt}
                        width={ADMIN_LOGOS[programAdminId].width}
                        height={ADMIN_LOGOS[programAdminId].height}
                        className="object-contain"
                        priority
                    />
                )}
            </div>

            <div className="space-y-6">
                {/* Summary banner — sentence with a couple of inline figures. */}
                <div className="rounded-2xl bg-slate-100 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm leading-relaxed text-slate-700">
                        <span>You are managing</span>
                        <Bar className="h-4 w-24" />
                        <span>with</span>
                        <Bar className="h-4 w-16" />
                        <span>in committed funding.</span>
                    </div>
                </div>

                {/* KPI grid — 5 cards on lg, 3 on sm, 2 on default. Matches live. */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {Array.from({ length: KPI_COUNT }).map((_, i) => (
                        <KpiCardSkeleton key={i} />
                    ))}
                </div>

                {/* Project tabs panel */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
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
                                        Status
                                    </th>
                                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                                        Last Modified
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

                {/* Quick actions card */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Shortcuts to common tasks.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: ACTION_COUNT }).map((_, i) => (
                            <QuickActionSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>

            <span className="sr-only">Loading dashboard data…</span>
        </main>
    );
}