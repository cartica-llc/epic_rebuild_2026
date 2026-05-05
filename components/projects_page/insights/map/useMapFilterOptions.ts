// components/projects_page/insights/map/useMapFilterOptions.ts

'use client';

import { useEffect, useState } from 'react';
import type { MapFilterOptions } from './shared/types';

interface State {
    options: MapFilterOptions;
    loading: boolean;
    error: string | null;
}

const EMPTY: MapFilterOptions = { investmentAreas: [] };

export function useMapFilterOptions() {
    const [state, setState] = useState<State>({
        options: EMPTY,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        fetch('/api/map/filters', { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Request failed (${res.status})`);
                return res.json();
            })
            .then((json: MapFilterOptions) => {
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
