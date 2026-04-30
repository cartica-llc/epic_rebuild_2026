// components/dashboard/masterAdmin/types.ts


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