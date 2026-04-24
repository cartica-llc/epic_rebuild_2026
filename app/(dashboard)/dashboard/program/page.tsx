// app/dashboard/program/page.tsx

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { query } from '@/lib/snowflake';
import { orgToAdminId } from '@/components/project_forms/types';
import { ProgramAdminDashboard } from '@/components/dashboard/programAdmin/ProgramAdminDashboard';

const DB = process.env.SNOWFLAKE_DATABASE;
const SCHEMA = process.env.SNOWFLAKE_SCHEMA;

export interface DashboardKPIs {
    activeProjects: number;
    inactiveProjects: number;
    totalCommittedFunding: number;
    fundsExpendedToDate: number;
    dacLiSpendPct: number;
}

export interface DashboardProject {
    projectId: number;
    projectNumber: string;
    projectName: string;
    projectStatus: string;
    isActive: boolean;
    modifiedDate: string | null;
}

export interface DashboardData {
    kpis: DashboardKPIs;
    recentActiveProjects: DashboardProject[];
    recentInactiveProjects: DashboardProject[];
}

type Row = Record<string, unknown>;
function toRows(result: unknown): Row[] {
    if (!Array.isArray(result)) return [];
    return result.map((r) => (r !== null && typeof r === 'object' ? (r as Row) : {}));
}

async function fetchDashboardData(programAdminId: number | null): Promise<DashboardData> {
    const t = `${DB}.${SCHEMA}`;
    const scopeClause = programAdminId !== null
        ? `AND p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID = ${programAdminId}`
        : '';

    const [kpiResult, activeResult, inactiveResult] = await Promise.all([
        query(`
            SELECT
                COUNT(CASE WHEN COALESCE(p.IS_ACTIVE, 1) = 1 THEN 1 END)  AS ACTIVE_PROJECTS,
                COUNT(CASE WHEN COALESCE(p.IS_ACTIVE, 1) = 0 THEN 1 END)  AS INACTIVE_PROJECTS,
                COALESCE(SUM(CASE WHEN COALESCE(p.IS_ACTIVE,1)=1 THEN fd.COMMITED_FUNDING_AMT END), 0) AS TOTAL_COMMITTED,
                COALESCE(SUM(CASE WHEN COALESCE(p.IS_ACTIVE,1)=1 THEN fd.FUNDS_EXPENDED_TO_DATE END), 0) AS TOTAL_EXPENDED,
                CASE
                    WHEN COALESCE(SUM(CASE WHEN COALESCE(p.IS_ACTIVE,1)=1 THEN fd.COMMITED_FUNDING_AMT END), 0) = 0 THEN 0
                    ELSE ROUND(
                        100.0 * COALESCE(SUM(
                            CASE WHEN COALESCE(p.IS_ACTIVE,1)=1 AND (p.CPUC_DAC=1 OR p.CPUC_LI=1)
                            THEN fd.COMMITED_FUNDING_AMT END
                        ), 0)
                        / COALESCE(SUM(CASE WHEN COALESCE(p.IS_ACTIVE,1)=1 THEN fd.COMMITED_FUNDING_AMT END), 0),
                    2)
                END AS DAC_LI_PCT
            FROM ${t}.PROJECT p
            LEFT JOIN ${t}.FINANCE_DETAIL fd ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
            WHERE 1=1 ${scopeClause}
        `),
        query(`
            SELECT
                p.PROJECT_ID,
                p.PROJECT_NUMBER,
                p.PROJECT_NAME,
                p.PROJECT_STATUS,
                p.IS_ACTIVE,
                p.MODIFIED_DATE
            FROM ${t}.PROJECT p
            WHERE COALESCE(p.IS_ACTIVE, 1) = 1 ${scopeClause}
            ORDER BY p.CREATE_DATE DESC
            LIMIT 5
        `),
        query(`
            SELECT
                p.PROJECT_ID,
                p.PROJECT_NUMBER,
                p.PROJECT_NAME,
                p.PROJECT_STATUS,
                p.IS_ACTIVE,
                p.MODIFIED_DATE
            FROM ${t}.PROJECT p
            WHERE COALESCE(p.IS_ACTIVE, 1) = 0 ${scopeClause}
            ORDER BY p.CREATE_DATE DESC
        `),
    ]);

    const kpiRows = toRows(kpiResult);
    const activeRows = toRows(activeResult);
    const inactiveRows = toRows(inactiveResult);

    const boolFlag = (v: unknown) => v === 1 || v === true || v === '1' || Number(v) === 1;
    const num = (v: unknown) => (v != null ? Number(v) : 0);
    const str = (v: unknown) => (v != null ? String(v) : '');

    const mapProject = (r: Row): DashboardProject => ({
        projectId: num(r.PROJECT_ID),
        projectNumber: str(r.PROJECT_NUMBER).toUpperCase(),
        projectName: str(r.PROJECT_NAME),
        projectStatus: str(r.PROJECT_STATUS),
        isActive: boolFlag(r.IS_ACTIVE),
        modifiedDate: (() => {
            const v = r.MODIFIED_DATE;
            if (!v) return null;
            if (v instanceof Date) return v.toISOString();
            return str(v);
        })(),
    });

    const k = kpiRows[0] ?? {};
    return {
        kpis: {
            activeProjects: num(k.ACTIVE_PROJECTS),
            inactiveProjects: num(k.INACTIVE_PROJECTS),
            totalCommittedFunding: num(k.TOTAL_COMMITTED),
            fundsExpendedToDate: num(k.TOTAL_EXPENDED),
            dacLiSpendPct: num(k.DAC_LI_PCT),
        },
        recentActiveProjects: activeRows.map(mapProject),
        recentInactiveProjects: inactiveRows.map(mapProject),
    };
}

export default async function ProgramDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/');

    const groups = (session.user as { groups?: string[] }).groups ?? [];
    if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
        redirect('/unauthorized');
    }

    const userOrg = (session.user as { organization?: string | null }).organization ?? null;
    const isMasterAdmin = groups.includes('MasterAdmin');
    const programAdminId = isMasterAdmin ? null : orgToAdminId(userOrg ?? '');

    const data = await fetchDashboardData(programAdminId);

    return (
        <ProgramAdminDashboard
            userName={session.user.name ?? session.user.email ?? 'Admin'}
            userEmail={session.user.email ?? ''}
            userOrg={userOrg}
            isMasterAdmin={isMasterAdmin}
            programAdminId={programAdminId}
            data={data}
        />
    );
}