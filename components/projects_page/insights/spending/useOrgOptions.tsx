// components/projects_page/insights/spending/useOrgOptions.ts

'use client';

import { useEffect, useState } from 'react';
import type { OrgOption } from './SpendingFilters';

export function useOrgOptions() {
    const [orgs, setOrgs] = useState<OrgOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch('/api/projectsList/lookups');
                if (!res.ok) throw new Error(`Lookups request failed (${res.status})`);
                const data = await res.json();
                if (!cancelled) {
                    setOrgs(Array.isArray(data.programAdmins) ? data.programAdmins : []);
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Unknown error';
                    console.error('Failed to load org options:', message);
                    setError(message);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return { orgs, loading, error };
}