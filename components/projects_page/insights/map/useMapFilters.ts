// components/projects_page/insights/map/useMapFilters.ts

'use client';

import { useCallback, useMemo, useState } from 'react';

export interface MapFilters {
    area: string;        // '' = all
    dacliOnly: boolean;
}

const DEFAULTS: MapFilters = {
    area: '',
    dacliOnly: false,
};

export function useMapFilters() {
    const [filters, setFilters] = useState<MapFilters>(DEFAULTS);

    const setArea = useCallback(
        (area: string) => setFilters((f) => ({ ...f, area })),
        [],
    );

    const setDacliOnly = useCallback(
        (dacliOnly: boolean) => setFilters((f) => ({ ...f, dacliOnly })),
        [],
    );

    const reset = useCallback(() => setFilters(DEFAULTS), []);

    const hasActiveFilters = filters.area !== '' || filters.dacliOnly;

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.area) params.set('area', filters.area);
        if (filters.dacliOnly) params.set('dacli', 'true');
        return params.toString();
    }, [filters]);

    return {
        filters,
        setArea,
        setDacliOnly,
        reset,
        hasActiveFilters,
        queryString,
    };
}
