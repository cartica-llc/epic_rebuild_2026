//app/projects/create/page.tsx ─────────────────────────────────────
// create new project, the form is the same for both but with different props for the route
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ProjectForm } from '@/components/project_forms/ProjectForm';

function hasGroups(user: unknown): user is { groups?: string[] } {
    return typeof user === 'object' && user !== null && 'groups' in user;
}

export default async function CreateProjectPage() {
    const session = await auth();
    if (!session?.user) redirect('/');

    const groups = hasGroups(session.user) ? session.user.groups ?? [] : [];

    if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
        redirect('/unauthorized');
    }

    return <ProjectForm mode="create" />;
}