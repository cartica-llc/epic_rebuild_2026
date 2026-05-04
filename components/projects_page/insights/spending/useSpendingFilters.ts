// components/projects_page/insights/spending/useSpendingFilters.ts

'use client';

import { useCallback, useMemo, useState } from 'react';

export interface SpendingFilters {
    period: string;
    area: string;
}

const DEFAULTS: SpendingFilters = {
    period: 'all',
    area: 'all',
};

export function useSpendingFilters() {
    const [filters, setFilters] = useState<SpendingFilters>(DEFAULTS);

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
        if (filters.period !== 'all') params.set('period', filters.period);
        if (filters.area !== 'all') params.set('area', filters.area);
        return params.toString();
    }, [filters]);

    return { filters, setPeriod, setArea, reset, queryString };
}