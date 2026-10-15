// lib/compliance/complianceScope.ts


import type { Session } from 'next-auth';

import { orgToAdminId } from '@/components/project_forms/types';

export const MASTER_ADMIN_GROUP = 'MasterAdmin';
export const PROGRAM_ADMIN_GROUP = 'ProgramAdmin';

/**
 * What a caller is allowed to see.
 *  - { kind: 'all' }                  → MasterAdmin, no row filter
 *  - { kind: 'org', programAdminId }  → ProgramAdmin, rows WHERE PROGRAM_ADMIN_ID = programAdminId
 */
export type ComplianceScope =
    | { kind: 'all' }
    | { kind: 'org'; programAdminId: number };

type SessionUser = {
    groups?: string[];
    organization?: string | null;
};

function sessionUser(session: Session | null): SessionUser | undefined {
    return session?.user as SessionUser | undefined;
}

function sessionGroups(session: Session | null): string[] {
    return (sessionUser(session)?.groups ?? []).filter((g): g is string => typeof g === 'string');
}

export function isMasterAdmin(session: Session | null): boolean {
    return sessionGroups(session).includes(MASTER_ADMIN_GROUP);
}

export function isProgramAdmin(session: Session | null): boolean {
    return sessionGroups(session).includes(PROGRAM_ADMIN_GROUP);
}

/**
 * Returns the org ID bound to a ProgramAdmin session, or null if the session
 * is not a program admin OR the organization is missing/unknown. A missing
 * org is treated as "no access", never as "all access".
 *
 * orgToAdminId() returns null for an unknown org, and we additionally refuse
 * to call it with a blank string, so nothing can fall through to a real ID.
 */
export function programAdminIdFromSession(session: Session | null): number | null {
    if (!isProgramAdmin(session)) return null;

    const org = (sessionUser(session)?.organization ?? '').trim();
    if (org === '') return null;

    const id = orgToAdminId(org);
    if (id === null || id === undefined) return null;

    return Number.isInteger(id) && id >= 0 ? id : null;
}

/**
 * Resolve the scope for the MASTER route/page. Only MasterAdmin may use it.
 */
export function resolveMasterScope(session: Session | null): ComplianceScope | null {
    return isMasterAdmin(session) ? { kind: 'all' } : null;
}

/**
 * Resolve the scope for the PROGRAM route/page.
 *
 * A MasterAdmin who is ALSO in the ProgramAdmin group is still a master — they
 * get sent to the master page rather than a single-org view, matching how
 * program/page.tsx treats isMasterAdmin. Pure masters get null here (403 on
 * the API, redirect on the page).
 */
export function resolveProgramScope(session: Session | null): ComplianceScope | null {
    if (isMasterAdmin(session)) return null;
    const id = programAdminIdFromSession(session);
    return id === null ? null : { kind: 'org', programAdminId: id };
}