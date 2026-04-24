// app/(dashboard)/dashboard/master/page.tsx

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { query } from '@/lib/snowflake';
import { MasterAdminDashboard } from '@/components/dashboard/masterAdmin/MasterAdminDashboard';

const DB = process.env.SNOWFLAKE_DATABASE;
const SCHEMA = process.env.SNOWFLAKE_SCHEMA;

// Banner still needs these counts even though the KPI grid is gone.
export interface MasterDashboardBannerStats {
    activeProjects: number;
    inactiveProjects: number;
    totalOrganizations: number;
}

export interface MasterDashboardProject {
    projectId: number;
    projectNumber: string;
    projectName: string;
    projectStatus: string;
    isActive: boolean;
    createDate: string | null;
    programAdminId: number | null;
    organizationName: string;
}

export interface MasterDashboardData {
    bannerStats: MasterDashboardBannerStats;
    recentActiveProjects: MasterDashboardProject[];
    recentInactiveProjects: MasterDashboardProject[];
}

type Row = Record<string, unknown>;
function toRows(result: unknown): Row[] {
    if (!Array.isArray(result)) return [];
    return result.map((r) => (r !== null && typeof r === 'object' ? (r as Row) : {}));
}

// Snowflake SDK can return column names in either upper or lower case
// depending on connection config. This helper checks both so we don't
// silently get nulls from a casing mismatch.
function pick(r: Row, key: string): unknown {
    if (key in r) return r[key];
    const lower = key.toLowerCase();
    if (lower in r) return r[lower];
    return undefined;
}

// Map PROGRAM_ADMIN_ID -> display name. Keep in sync with orgToAdminId in project_forms/types.
const ADMIN_ID_TO_ORG: Record<number, string> = {
    0: 'EPC',
    1: 'SCE',
    2: 'SDGE',
    3: 'PGE',
};

async function fetchMasterDashboardData(): Promise<MasterDashboardData> {
    const t = `${DB}.${SCHEMA}`;

    // MasterAdmin sees all orgs — no scope clause.
    // CREATE_DATE falls back to MODIFIED_DATE for legacy rows where CREATE_DATE was never set.
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
    return {
        bannerStats: {
            activeProjects: num(pick(b, 'ACTIVE_PROJECTS')),
            inactiveProjects: num(pick(b, 'INACTIVE_PROJECTS')),
            totalOrganizations: num(pick(b, 'TOTAL_ORGS')),
        },
        recentActiveProjects: activeRows.map(mapProject),
        recentInactiveProjects: inactiveRows.map(mapProject),
    };
}

export default async function MasterDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/');

    const groups = session.user.groups ?? [];
    if (!groups.includes('MasterAdmin')) redirect('/unauthorized');

    const data = await fetchMasterDashboardData();

    return (
        <MasterAdminDashboard
            userName={session.user.name ?? session.user.email ?? 'Master Admin'}
            userEmail={session.user.email ?? ''}
            data={data}
        />
    );
}