// app/(dashboard)/dashboard/master/program-program-compliance/page.tsx

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ComplianceDashboardClient } from '@/components/dashboard/compliance';

export default async function MasterCompliancePage() {
    const session = await auth();
    if (!session?.user) redirect('/');

    const groups = session.user.groups ?? [];
    if (!groups.includes('MasterAdmin')) redirect('/unauthorized');

    return <ComplianceDashboardClient />;
}