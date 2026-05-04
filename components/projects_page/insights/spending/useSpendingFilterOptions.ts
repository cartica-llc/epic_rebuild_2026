// components/projects_page/insights/spending/useSpendingFilterOptions.ts

'use client';

import { useInsightFetch } from './shared/useInsightFetch';

interface FilterOptionsResponse {
    periods: string[];
    areas: string[];
}

/**
 * Fetched once when the spending insight mounts. Cached for 5 minutes
 * server-side, so revisiting the page won't re-hit Snowflake.
 */
export function useSpendingFilterOptions() {
    const { data, loading, error } = useInsightFetch<FilterOptionsResponse>(
        '/api/spending/filters',
    );

    return {
        periods: data?.periods ?? [],
        areas: data?.areas ?? [],
        loading,
        error,
    };
}
