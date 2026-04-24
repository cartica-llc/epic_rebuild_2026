// lib/permissions.ts

export const ROLES = {
    MASTER_ADMIN: "MasterAdmin",
    PROGRAM_ADMIN: "ProgramAdmin",
} as const;

// ─── Organization ↔ Program Admin ID mapping ─────────────────────────
// Snowflake PROGRAM_ADMIN_ID  →  Cognito custom:organization value
export const ORG_TO_ADMIN_ID: Record<string, number> = {
    epc: 0,
    sce: 1,
    sdge: 2,
    pge: 3,
};

export const ADMIN_ID_TO_ORG: Record<number, string> = {
    0: "epc",
    1: "sce",
    2: "sdge",
    3: "pge",
};

// ─── Role helpers ────────────────────────────────────────────────────

export function hasRole(groups: string[], role: string): boolean {
    return groups.includes(role);
}

export function isMasterAdmin(groups: string[]): boolean {
    return hasRole(groups, ROLES.MASTER_ADMIN);
}

export function isProgramAdmin(groups: string[]): boolean {
    return hasRole(groups, ROLES.PROGRAM_ADMIN);
}

export function canManageUsers(groups: string[]): boolean {
    return isMasterAdmin(groups);
}

// ─── Project-level edit authorization ────────────────────────────────

/**
 * Determines whether a user can edit a given project based on their
 * Cognito `custom:organization` attribute and the project's program admin ID.
 *
 * Rules:
 *  - "master" org can edit ANY project
 *  - Other orgs (epc, sce, sdge, pge) can only edit projects whose
 *    PROGRAM_ADMIN_ID matches their org
 *  - No org / unrecognized org → no edit access
 *
 * @param userOrganization - The user's `custom:organization` value from Cognito (lowercase)
 * @param projectProgramAdminId - The project's PROGRAM_ADMIN_PROGRAM_ADMIN_ID from Snowflake
 */
export function canEditProject(
    userOrganization: string | undefined | null,
    projectProgramAdminId: number | undefined | null,
): boolean {
    if (!userOrganization) return false;

    const org = userOrganization.toLowerCase().trim();

    // Master org can edit everything
    if (org === "master") return true;

    // No admin ID on the project → can't match, deny
    if (projectProgramAdminId === undefined || projectProgramAdminId === null) return false;

    // Check if the user's org maps to this project's admin ID
    const allowedAdminId = ORG_TO_ADMIN_ID[org];
    if (allowedAdminId === undefined) return false;

    return allowedAdminId === projectProgramAdminId;
}

export function assertCanEditProject(
    userOrganization: string | undefined | null,
    projectProgramAdminId: number | undefined | null,
): void {
    if (!canEditProject(userOrganization, projectProgramAdminId)) {
        throw new Error("Forbidden: you do not have permission to edit this project");
    }
}