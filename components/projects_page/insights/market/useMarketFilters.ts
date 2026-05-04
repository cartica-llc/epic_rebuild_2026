// components/projects_page/insights/market/useMarketFilters.ts

'use client';

import { useCallback, useMemo, useState } from 'react';
import type { MaturityStage, SignalBand } from './shared/types';

export interface MarketFilters {
    maturity: MaturityStage | null;
    band: SignalBand | null;
    minScore: 0 | 3 | 4;
    nearMarketOnly: boolean;
}

const DEFAULTS: MarketFilters = {
    maturity: null,
    band: null,
    minScore: 0,
    nearMarketOnly: false,
};

export function useMarketFilters() {
    const [filters, setFilters] = useState<MarketFilters>(DEFAULTS);

    const setMaturity = useCallback(
        (maturity: MaturityStage | null) =>
            setFilters((f) => ({ ...f, maturity })),
        [],
    );

    const setBand = useCallback(
        (band: SignalBand | null) => setFilters((f) => ({ ...f, band })),
        [],
    );

    const setMinScore = useCallback(
        (minScore: 0 | 3 | 4) => setFilters((f) => ({ ...f, minScore })),
        [],
    );

    const setNearMarketOnly = useCallback(
        (nearMarketOnly: boolean) => setFilters((f) => ({ ...f, nearMarketOnly })),
        [],
    );

    const reset = useCallback(() => setFilters(DEFAULTS), []);

    const hasActiveFilters =
        filters.maturity !== null ||
        filters.band !== null ||
        filters.minScore > 0 ||
        filters.nearMarketOnly;

    /** Query string for /api/market/projects (table only — pipeline/signals are unfiltered). */
    const projectsQueryString = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.maturity) params.set('maturity', filters.maturity);
        if (filters.band) params.set('band', filters.band);
        if (filters.minScore > 0) params.set('minScore', String(filters.minScore));
        if (filters.nearMarketOnly) params.set('nearMarket', 'true');
        return params.toString();
    }, [filters]);

    return {
        filters,
        setMaturity,
        setBand,
        setMinScore,
        setNearMarketOnly,
        reset,
        hasActiveFilters,
        projectsQueryString,
    };
}
