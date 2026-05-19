// components/projects_page/insights/market/useMarketFilters.ts

'use client';

import { useCallback, useMemo, useState } from 'react';
import type { MaturityStage, SignalBand } from './shared/types';

export interface MarketFilters {
    maturity: MaturityStage | null;
    band: SignalBand | null;
    scoreFilter: number;
}

const DEFAULTS: MarketFilters = {
    maturity: null,
    band: null,
    scoreFilter: 0,
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

    const setScoreFilter = useCallback(
        (scoreFilter: number) => setFilters((f) => ({ ...f, scoreFilter })),
        [],
    );

    const reset = useCallback(() => setFilters(DEFAULTS), []);

    const hasActiveFilters =
        filters.maturity !== null ||
        filters.band !== null ||
        filters.scoreFilter > 0;

    const projectsQueryString = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.maturity) params.set('maturity', filters.maturity);
        if (filters.band) params.set('band', filters.band);
        // Always fetch the full superset; exact filtering happens client-side
        return params.toString();
    }, [filters.maturity, filters.band]);

    return {
        filters,
        setMaturity,
        setBand,
        setScoreFilter,
        reset,
        hasActiveFilters,
        projectsQueryString,
    };
}