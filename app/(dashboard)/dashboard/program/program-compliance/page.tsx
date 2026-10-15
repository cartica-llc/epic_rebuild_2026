// app/(dashboard)/dashboard/program/program-compliance/page.tsx

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ComplianceDashboardClient } from '@/components/dashboard/compliance';
import { isMasterAdmin, resolveProgramScope } from '@/lib/compliance/complianceScope';

export const dynamic = 'force-dynamic';

export default async function ProgramCompliancePage() {
    const session = await auth();
    if (!session?.user) redirect('/');

    // Masters have their own portfolio-wide page.
    if (isMasterAdmin(session)) redirect('/dashboard/master/compliance');

    const scope = resolveProgramScope(session);
    if (!scope) redirect('/unauthorized');

    return <ComplianceDashboardClient scope="program" />;
}