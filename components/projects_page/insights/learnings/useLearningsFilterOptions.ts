// components/projects_page/insights/learnings/useLearningsFilterOptions.ts

'use client';

import { useEffect, useState } from 'react';

interface FilterOptions {
    investmentAreas: string[];
    cpucProceedings: string[];
    statuses: string[];
}

interface State {
    options: FilterOptions;
    loading: boolean;
    error: string | null;
}

const EMPTY: FilterOptions = {
    investmentAreas: [],
    cpucProceedings: [],
    statuses: [],
};

/**
 * Fetched once when the Learnings insight mounts. Server caches for 5 minutes
 * so revisiting the page doesn't re-hit Snowflake.
 */
export function useLearningsFilterOptions() {
    const [state, setState] = useState<State>({
        options: EMPTY,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        fetch('/api/learnings/filters', { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Request failed (${res.status})`);
                return res.json();
            })
            .then((json: FilterOptions) => {
                if (cancelled) return;
                setState({ options: json, loading: false, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                if (err instanceof DOMException && err.name === 'AbortError') return;
                const message = err instanceof Error ? err.message : 'Unknown error';
                setState({ options: EMPTY, loading: false, error: message });
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    return state;
}
