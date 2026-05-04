// components/projects_page/insights/spending/shared/useInsightFetch.ts

'use client';

import { useEffect, useState } from 'react';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useInsightFetch<T>(url: string): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        const run = async () => {
            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));

            try {
                const res = await fetch(url, { signal: controller.signal });

                if (!res.ok) {
                    throw new Error(`Request failed (${res.status})`);
                }

                const json = (await res.json()) as T;

                if (cancelled) return;

                setState({
                    data: json,
                    loading: false,
                    error: null,
                });
            } catch (err: unknown) {
                if (cancelled) return;
                if (err instanceof DOMException && err.name === 'AbortError') return;

                const message = err instanceof Error ? err.message : 'Unknown error';

                setState({
                    data: null,
                    loading: false,
                    error: message,
                });
            }
        };

        void run();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [url]);

    return state;
}