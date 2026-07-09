// components/dashboard/masterAdmin/MasterAdminDashboard.tsx

'use client';

import { MasterDashboardSummaryBanner } from './MasterDashboardSummaryBanner';
import { MasterDashboardProjectTabs } from './MasterDashboardProjectTabs';
import { QuickActions } from './QuickActions';
import type { QuickAction } from './QuickActionLink';
import type { MasterDashboardData } from './types';

const quickActions: QuickAction[] = [
    { label: "Manage Users", href: "/dashboard/master/users", icon: "users" },
    { label: "Add User", href: "/dashboard/master/users/create", icon: "user-plus" },
    { label: "Compliance", href: "/dashboard/master/compliance", icon: "shield-check" },
    {
        label: "EPIC Database Guides",
        href: "/dashboard/master/docs",
        icon: "book-open",
    },
]

interface Props {
    userName: string;
    userEmail: string;
    data: MasterDashboardData;
}

export function MasterAdminDashboard({ userName, userEmail, data }: Props) {
    return (
        <main className="mx-auto mt-6 max-w-[1400px] px-4  sm:px-6 lg:px-8">

            <div className="mb-8 flex items-center justify-between gap-4  ">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{userName}</h1>
                    <p className="mt-0.5 text-sm text-slate-500">{userEmail}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Master Admin — all organizations
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Banner spans full width */}
                <MasterDashboardSummaryBanner stats={data.bannerStats} />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <MasterDashboardProjectTabs
                            activeProjects={data.recentActiveProjects}
                            inactiveProjects={data.recentInactiveProjects}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <QuickActions actions={quickActions} />
                    </div>




                </div>
            </div>
        </main>
    );
}