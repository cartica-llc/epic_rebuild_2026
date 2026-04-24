// components/dashboard/program_admin/ProgramAdminDashboard.tsx

'use client';

import Image from 'next/image';
// import { SignOutButton } from '@/components/auth/SignOutButton';
import { DashboardKPIGrid } from './DashboardKPIGrid';
import { DashboardSummaryBanner } from './DashboardSummaryBanner';
import { DashboardProjectTabs } from './DashboardProjectTabs';
import { DashboardQuickActions } from './DashboardQuickActions';
import type { DashboardData } from '@/app/(dashboard)/dashboard/program/page';


const ADMIN_LOGOS: Record<number, { src: string; alt: string; width: number; height: number }> = {
    0: { src: '/dashboardLogos/cec.png',  alt: 'California Energy Commission', width: 120, height: 48 },
    1: { src: '/dashboardLogos/sce.svg',  alt: 'Southern California Edison',   width: 120, height: 48 },
    2: { src: '/dashboardLogos/sdge.svg', alt: 'San Diego Gas & Electric',     width: 120, height: 48 },
    3: { src: '/dashboardLogos/pge.png',  alt: 'Pacific Gas & Electric',       width: 120, height: 48 },
};

interface Props {
    userName: string;
    userEmail: string;
    userOrg: string | null;
    isMasterAdmin: boolean;
    programAdminId: number | null;
    data: DashboardData;
}

export function ProgramAdminDashboard({
                                          userName,
                                          userEmail,
                                          userOrg,
                                          isMasterAdmin,
                                          programAdminId,
                                          data,
                                      }: Props) {
    return (
        <main className="mx-auto mt-6 max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
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
                {/*<SignOutButton />*/}
            </div>

            <div className="space-y-6">
                <DashboardSummaryBanner kpis={data.kpis} />
                <DashboardKPIGrid kpis={data.kpis} />
                <DashboardProjectTabs
                    activeProjects={data.recentActiveProjects}
                    inactiveProjects={data.recentInactiveProjects}
                />
                <DashboardQuickActions programAdminId={programAdminId} />
            </div>
        </main>
    );
}