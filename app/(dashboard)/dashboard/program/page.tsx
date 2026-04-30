// app/(dashboard)/dashboard/program/page.tsx


import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { orgToAdminId } from '@/components/project_forms/types';
import { ProgramAdminDashboardClient } from '@/components/dashboard/programAdmin/ProgramAdminDashboardClient';

export default async function ProgramDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/');

    const groups = (session.user as { groups?: string[] }).groups ?? [];
    if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
        redirect('/unauthorized');
    }

    const userOrg =
        (session.user as { organization?: string | null }).organization ?? null;
    const isMasterAdmin = groups.includes('MasterAdmin');
    const programAdminId = isMasterAdmin ? null : orgToAdminId(userOrg ?? '');

    return (
        <ProgramAdminDashboardClient
            userName={session.user.name ?? session.user.email ?? 'Admin'}
            userEmail={session.user.email ?? ''}
            userOrg={userOrg}
            isMasterAdmin={isMasterAdmin}
            programAdminId={programAdminId}
        />
    );
}