// components/project_detail_page/shared/useCanEdit.ts
'use client';

import { useSession } from 'next-auth/react';
import { canEditProject, isMasterAdmin } from '@/lib/permissions';

export function useCanEdit(projectProgramAdminId: number | null | undefined): boolean {
    const { data: session, status } = useSession();

    if (status !== 'authenticated' || !session?.user) return false;

    const user = session.user as {
        groups?: string[];
        organization?: string | null;
    };

    const groups = user.groups ?? [];

    if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) return false;

    // MasterAdmin can edit anything
    if (isMasterAdmin(groups)) return true;

    // ProgramAdmin: org must match the project
    return canEditProject(user.organization, projectProgramAdminId);
}