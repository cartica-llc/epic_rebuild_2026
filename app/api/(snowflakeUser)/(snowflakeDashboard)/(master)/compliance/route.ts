// app/api/(snowflakeUser)/(snowflakeDashboard)/(master)/compliance/route.ts
//   → GET /api/compliance   (MasterAdmin only — every program admin's projects)
//
// All field logic lives in lib/compliance/loadComplianceProjects.ts and is
// shared with the program-admin route. The only difference between the two
// routes is the scope passed in.

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import type { ComplianceApiResponse } from '@/components/dashboard/compliance';
import { resolveMasterScope } from '@/lib/compliance/complianceScope';
import { loadComplianceProjects } from '@/lib/compliance/loadComplianceProjects';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const scope = resolveMasterScope(session);
        if (!scope) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const projects = await loadComplianceProjects(scope);

        const body: ComplianceApiResponse = {
            projects,
            generatedAt: new Date().toISOString(),
        };

        const res = NextResponse.json(body);
        res.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120');
        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Compliance (master) route error:', message);
        return NextResponse.json({ error: 'Failed to load compliance data' }, { status: 500 });
    }
}