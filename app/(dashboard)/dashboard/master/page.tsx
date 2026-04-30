// app/(dashboard)/dashboard/master/page.tsx

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { MasterAdminDashboardClient } from '@/components/dashboard/masterAdmin/Masteradmindashboardclient';

export default async function MasterDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/');

    const groups = session.user.groups ?? [];
    if (!groups.includes('MasterAdmin')) redirect('/unauthorized');

    return (
        <MasterAdminDashboardClient
            userName={session.user.name ?? session.user.email ?? 'Master Admin'}
            userEmail={session.user.email ?? ''}
        />
    );
}