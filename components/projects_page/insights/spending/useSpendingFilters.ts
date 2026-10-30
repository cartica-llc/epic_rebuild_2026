// components/projects_page/insights/spending/useSpendingFilters.ts

'use client';

import { useCallback, useMemo, useState } from 'react';

export interface SpendingFilters {
    org: string;
    period: string;
    area: string;
}

const DEFAULTS: SpendingFilters = {
    org: 'all',
    period: 'all',
    area: 'all',
};

export function useSpendingFilters() {
    const [filters, setFilters] = useState<SpendingFilters>(DEFAULTS);

    const setOrg = useCallback(
        (org: string) => setFilters((f) => ({ ...f, org })),
        [],
    );
    const setPeriod = useCallback(
        (period: string) => setFilters((f) => ({ ...f, period })),
        [],
    );
    const setArea = useCallback(
        (area: string) => setFilters((f) => ({ ...f, area })),
        [],
    );
    const reset = useCallback(() => setFilters(DEFAULTS), []);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.org !== 'all') params.set('org', filters.org);
        if (filters.period !== 'all') params.set('period', filters.period);
        if (filters.area !== 'all') params.set('area', filters.area);
        return params.toString();
    }, [filters]);

    return { filters, setOrg, setPeriod, setArea, reset, queryString };
}