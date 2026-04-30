// app/api/master-dashboard/route.ts

import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { query } from '@/lib/snowflake';
import type {
    MasterDashboardData,
    MasterDashboardProject,
} from '@/components/dashboard/masterAdmin/types';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

// ── Helpers ──────────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function toRows(result: unknown): Row[] {
    if (!Array.isArray(result)) return [];
    return result.map((r) => (r !== null && typeof r === 'object' ? (r as Row) : {}));
}

function pick(r: Row, key: string): unknown {
    if (key in r) return r[key];
    const lower = key.toLowerCase();
    if (lower in r) return r[lower];
    return undefined;
}

const ADMIN_ID_TO_ORG: Record<number, string> = {
    0: 'EPC',
    1: 'SCE',
    2: 'SDGE',
    3: 'PGE',
};


export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];
        if (!groups.includes('MasterAdmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const t = `${DB}.${SCHEMA}`;

        const [bannerResult, activeResult, inactiveResult] = await Promise.all([
            query(`
                SELECT
                    COUNT(CASE WHEN COALESCE(p.IS_ACTIVE, 1) = 1 THEN 1 END) AS ACTIVE_PROJECTS,
                    COUNT(CASE WHEN COALESCE(p.IS_ACTIVE, 1) = 0 THEN 1 END) AS INACTIVE_PROJECTS,
                    COUNT(DISTINCT p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID)         AS TOTAL_ORGS
                FROM ${t}.PROJECT p
            `),
            query(`
                SELECT
                    p.PROJECT_ID,
                    p.PROJECT_NUMBER,
                    p.PROJECT_NAME,
                    p.PROJECT_STATUS,
                    p.IS_ACTIVE,
                    COALESCE(p.CREATE_DATE, p.MODIFIED_DATE) AS CREATE_DATE,
                    p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS PROGRAM_ADMIN_ID
                FROM ${t}.PROJECT p
                WHERE COALESCE(p.IS_ACTIVE, 1) = 1
                ORDER BY COALESCE(p.CREATE_DATE, p.MODIFIED_DATE) DESC NULLS LAST
                LIMIT 5
            `),
            query(`
                SELECT
                    p.PROJECT_ID,
                    p.PROJECT_NUMBER,
                    p.PROJECT_NAME,
                    p.PROJECT_STATUS,
                    p.IS_ACTIVE,
                    COALESCE(p.CREATE_DATE, p.MODIFIED_DATE) AS CREATE_DATE,
                    p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS PROGRAM_ADMIN_ID
                FROM ${t}.PROJECT p
                WHERE COALESCE(p.IS_ACTIVE, 1) = 0
                ORDER BY COALESCE(p.CREATE_DATE, p.MODIFIED_DATE) DESC NULLS LAST
            `),
        ]);

        const bannerRows = toRows(bannerResult);
        const activeRows = toRows(activeResult);
        const inactiveRows = toRows(inactiveResult);

        const boolFlag = (v: unknown) => v === 1 || v === true || v === '1' || Number(v) === 1;
        const num = (v: unknown) => (v != null ? Number(v) : 0);
        const str = (v: unknown) => (v != null ? String(v) : '');
        const numOrNull = (v: unknown) => (v != null && v !== '' ? Number(v) : null);

        const mapProject = (r: Row): MasterDashboardProject => {
            const adminId = numOrNull(pick(r, 'PROGRAM_ADMIN_ID'));
            return {
                projectId: num(pick(r, 'PROJECT_ID')),
                projectNumber: str(pick(r, 'PROJECT_NUMBER')).toUpperCase(),
                projectName: str(pick(r, 'PROJECT_NAME')),
                projectStatus: str(pick(r, 'PROJECT_STATUS')),
                isActive: boolFlag(pick(r, 'IS_ACTIVE')),
                createDate: (() => {
                    const v = pick(r, 'CREATE_DATE');
                    if (!v) return null;
                    if (v instanceof Date) return v.toISOString();
                    return str(v);
                })(),
                programAdminId: adminId,
                organizationName: adminId !== null ? (ADMIN_ID_TO_ORG[adminId] ?? '—') : '—',
            };
        };

        const b = bannerRows[0] ?? {};
        const data: MasterDashboardData = {
            bannerStats: {
                activeProjects: num(pick(b, 'ACTIVE_PROJECTS')),
                inactiveProjects: num(pick(b, 'INACTIVE_PROJECTS')),
                totalOrganizations: num(pick(b, 'TOTAL_ORGS')),
            },
            recentActiveProjects: activeRows.map(mapProject),
            recentInactiveProjects: inactiveRows.map(mapProject),
        };

        return NextResponse.json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Master dashboard fetch error:', message);
        return NextResponse.json(
            { error: 'Failed to load master dashboard data' },
            { status: 500 },
        );
    }
}