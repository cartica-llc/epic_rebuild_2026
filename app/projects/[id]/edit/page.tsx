//app/projects/[id]/edit/page.tsx
//where you can edit a project

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ProjectForm } from '@/components/project_forms/ProjectForm';
import { query } from '@/lib/snowflake';
import { canEditProject, isMasterAdmin } from '@/lib/permissions';

const DB = process.env.SNOWFLAKE_DATABASE;
const SCHEMA = process.env.SNOWFLAKE_SCHEMA;

interface EditProjectPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) redirect('/');

    const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];
    if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
        redirect('/unauthorized');
    }

    // MasterAdmin can edit anything — skip the per-project DB lookup
    if (!isMasterAdmin(groups)) {
        const userOrg = (session.user as { organization?: string | null }).organization ?? null;

        const projectIdInt = parseInt(id, 10);
        if (isNaN(projectIdInt)) redirect('/');

        const rows = (await query(
            `SELECT PROGRAM_ADMIN_PROGRAM_ADMIN_ID AS PROGRAM_ADMIN_ID
             FROM ${DB}.${SCHEMA}.PROJECT
             WHERE PROJECT_ID = ${projectIdInt}`
        )) as { PROGRAM_ADMIN_ID: number | null }[];

        if (rows.length === 0) redirect('/');

        if (!canEditProject(userOrg, rows[0].PROGRAM_ADMIN_ID)) {
            redirect('/');
        }
    }

    return <ProjectForm mode="edit" projectId={id} />;
}