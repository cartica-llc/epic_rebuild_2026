// components/dashboard/programAdmin/types.ts
//
// Data shapes returned from /api/program-dashboard. Co-located with the
// dashboard component so the page.tsx file can stay a thin auth shell
// (no data, no types worth re-exporting).

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