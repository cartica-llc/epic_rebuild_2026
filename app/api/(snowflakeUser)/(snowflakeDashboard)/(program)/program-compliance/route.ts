//app/api/(snowflakeUser)/(snowflakeDashboard)/(program)/program-program-compliance/route.ts


import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import type { ComplianceApiResponse } from '@/components/dashboard/compliance';
import { resolveProgramScope } from '@/lib/compliance/complianceScope';
import { ComplianceScopeViolation, loadComplianceProjects } from '@/lib/compliance/loadComplianceProjects';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const scope = resolveProgramScope(session);
        if (!scope) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const projects = await loadComplianceProjects(scope);

        const body: ComplianceApiResponse = {
            projects,
            generatedAt: new Date().toISOString(),
        };

        const res = NextResponse.json(body);
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
    } catch (err: unknown) {
        if (err instanceof ComplianceScopeViolation) {
            // Log loudly — this means the SQL filter and the data disagree.
            console.error('[SECURITY] ', err.message);
        } else {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Compliance (program) route error:', message);
        }
        return NextResponse.json({ error: 'Failed to load program-compliance data' }, { status: 500 });
    }
}
